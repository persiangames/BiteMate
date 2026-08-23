import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import https from 'node:https';
import { once } from 'node:events';

const root = path.dirname(fileURLToPath(import.meta.url));
const pgHome = path.join(root, 'postgres');
const pgBin = path.join(pgHome, 'pgsql', 'bin');
const dataDir = path.join(root, 'data', 'pgdata');
const jarPath = path.join(root, 'postgres-win64.jar');
const PG_URL =
  'https://repo1.maven.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-windows-amd64/15.8.0/embedded-postgres-binaries-windows-amd64-15.8.0.jar';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const request = (target) => {
      https
        .get(target, (response) => {
          if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            request(response.headers.location);
            return;
          }
          if (response.statusCode !== 200) {
            reject(new Error(`Download failed: ${response.statusCode} ${target}`));
            return;
          }
          pipeline(response, createWriteStream(dest)).then(resolve).catch(reject);
        })
        .on('error', reject);
    };
    request(url);
  });
}

async function extractJar(jar, dest) {
  mkdirSync(dest, { recursive: true });
  const unzip = spawn('tar', ['-xf', jar, '-C', dest], { stdio: 'inherit', shell: true });
  const [code] = await once(unzip, 'close');
  if (code !== 0) {
    throw new Error(`Failed to extract Postgres binaries (exit ${code})`);
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code}`));
    });
  });
}

function findPostgresExe() {
  const candidates = [
    path.join(pgBin, 'postgres.exe'),
    path.join(pgHome, 'bin', 'postgres.exe'),
    path.join(pgHome, 'pgsql', 'bin', 'postgres.exe'),
  ];
  return candidates.find((file) => existsSync(file));
}

function binDirFrom(exe) {
  return path.dirname(exe);
}

async function ensurePostgresBinaries() {
  if (findPostgresExe()) return;
  if (!existsSync(jarPath)) {
    console.log('Downloading portable PostgreSQL (~22MB)...');
    await download(PG_URL, jarPath);
  }
  console.log('Extracting PostgreSQL...');
  await extractJar(jarPath, pgHome);
}

async function initAndStart() {
  await ensurePostgresBinaries();
  const postgresExe = findPostgresExe();
  if (!postgresExe) {
    throw new Error('postgres.exe not found after extract');
  }
  const binDir = binDirFrom(postgresExe);
  const initdb = path.join(binDir, 'initdb.exe');
  const pgctl = path.join(binDir, 'pg_ctl.exe');
  const createdb = path.join(binDir, 'createdb.exe');
  const createuser = path.join(binDir, 'createuser.exe');
  const psql = path.join(binDir, 'psql.exe');

  mkdirSync(path.dirname(dataDir), { recursive: true });
  if (!existsSync(path.join(dataDir, 'PG_VERSION'))) {
    await run(`"${initdb}"`, [
      '-D',
      `"${dataDir}"`,
      '-U',
      'postgres',
      '-A',
      'trust',
      '--locale=C',
      '--encoding=UTF8',
    ]);
  }

  const logFile = path.join(root, 'data', 'postgres.log');
  await run(`"${pgctl}"`, [
    '-D',
    `"${dataDir}"`,
    '-l',
    `"${logFile}"`,
    '-o',
    `"-p 5432"`,
    'start',
  ]);

  const env = { ...process.env, PGUSER: 'postgres', PGHOST: 'localhost', PGPORT: '5432' };
  try {
    await run(`"${psql}"`, ['-c', `"DO $$ BEGIN CREATE ROLE bitemate LOGIN PASSWORD 'bitemate_secret' SUPERUSER; EXCEPTION WHEN duplicate_object THEN NULL; END $$;"`], { env });
  } catch {
    try {
      await run(`"${createuser}"`, ['-s', 'bitemate'], { env });
    } catch {
      // role may already exist
    }
  }
  try {
    await run(`"${createdb}"`, ['-O', 'bitemate', 'bitemate'], { env });
  } catch {
    // database may already exist
  }

  console.log('PostgreSQL ready on localhost:5432 (user bitemate / db bitemate)');
}

try {
  await initAndStart();
} catch (error) {
  console.error(error);
  process.exit(1);
}

try {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongo = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'bitemate' },
  });
  console.log('MongoDB ready at', mongo.getUri());
} catch (error) {
  console.warn(
    'MongoDB memory server did not start. Chat will wait until Mongo is available.',
    error instanceof Error ? error.message : error,
  );
}

console.log('Keep this window open while you test BiteMate.');
await new Promise(() => undefined);
