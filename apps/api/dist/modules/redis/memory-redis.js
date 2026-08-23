"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRedis = void 0;
const node_events_1 = require("node:events");
class MemoryRedis extends node_events_1.EventEmitter {
    strings = new Map();
    geos = new Map();
    zsets = new Map();
    status = 'ready';
    alive(key) {
        const entry = this.strings.get(key);
        if (!entry)
            return undefined;
        if (entry.expiresAt && entry.expiresAt <= Date.now()) {
            this.strings.delete(key);
            return undefined;
        }
        return entry;
    }
    async connect() {
        return this;
    }
    async quit() {
        return 'OK';
    }
    async ping() {
        return 'PONG';
    }
    duplicate() {
        return this;
    }
    async get(key) {
        return this.alive(key)?.value ?? null;
    }
    async set(key, value, mode, ttl) {
        const entry = { value: String(value) };
        if ((mode === 'EX' || mode === 'PX') && typeof ttl === 'number') {
            entry.expiresAt = Date.now() + (mode === 'PX' ? ttl : ttl * 1000);
        }
        this.strings.set(key, entry);
        return 'OK';
    }
    async del(...keys) {
        let removed = 0;
        for (const key of keys) {
            if (this.strings.delete(key) || this.geos.delete(key))
                removed += 1;
        }
        return removed;
    }
    async incr(key) {
        const current = Number.parseInt(this.alive(key)?.value ?? '0', 10) || 0;
        const next = current + 1;
        const prev = this.strings.get(key);
        this.strings.set(key, { value: String(next), expiresAt: prev?.expiresAt });
        return next;
    }
    async expire(key, seconds) {
        const entry = this.strings.get(key);
        if (!entry)
            return 0;
        entry.expiresAt = Date.now() + seconds * 1000;
        return 1;
    }
    async pexpire(key, ms) {
        const entry = this.strings.get(key);
        if (!entry)
            return 0;
        entry.expiresAt = Date.now() + ms;
        return 1;
    }
    async ttl(key) {
        const entry = this.alive(key);
        if (!entry)
            return -2;
        if (!entry.expiresAt)
            return -1;
        return Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000));
    }
    async pttl(key) {
        const entry = this.alive(key);
        if (!entry)
            return -2;
        if (!entry.expiresAt)
            return -1;
        return Math.max(1, entry.expiresAt - Date.now());
    }
    async zadd(key, score, member) {
        const set = this.zsets.get(key) ?? new Map();
        set.set(String(member), Number(score));
        this.zsets.set(key, set);
        return 1;
    }
    async zrangebyscore(key, min, max, ...rest) {
        const set = this.zsets.get(key);
        if (!set)
            return [];
        const minScore = min === '-inf' ? Number.NEGATIVE_INFINITY : Number(min);
        const maxScore = max === '+inf' ? Number.POSITIVE_INFINITY : Number(max);
        let offset = 0;
        let count = set.size;
        const limitIndex = rest.findIndex((item) => String(item).toUpperCase() === 'LIMIT');
        if (limitIndex >= 0) {
            offset = Number(rest[limitIndex + 1] ?? 0);
            count = Number(rest[limitIndex + 2] ?? count);
        }
        return [...set.entries()]
            .filter(([, score]) => score >= minScore && score <= maxScore)
            .sort((a, b) => a[1] - b[1])
            .slice(offset, offset + count)
            .map(([member]) => member);
    }
    async zrem(key, ...members) {
        const set = this.zsets.get(key);
        if (!set)
            return 0;
        let removed = 0;
        for (const member of members) {
            if (set.delete(member))
                removed += 1;
        }
        return removed;
    }
    async hincrby(key, field, increment) {
        const hashKey = `${key}#${field}`;
        const current = Number.parseInt(this.alive(hashKey)?.value ?? '0', 10) || 0;
        const next = current + increment;
        this.strings.set(hashKey, { value: String(next) });
        return next;
    }
    async hset(key, data, value) {
        if (typeof data === 'string') {
            this.strings.set(`${key}#${data}`, { value: String(value ?? '') });
            return 1;
        }
        for (const [field, fieldValue] of Object.entries(data)) {
            this.strings.set(`${key}#${field}`, { value: String(fieldValue) });
        }
        return Object.keys(data).length;
    }
    async hgetall(key) {
        const prefix = `${key}#`;
        const result = {};
        for (const [storedKey, entry] of this.strings) {
            if (storedKey.startsWith(prefix) && this.alive(storedKey)) {
                result[storedKey.slice(prefix.length)] = entry.value;
            }
        }
        return result;
    }
    async geoadd(key, longitude, latitude, member) {
        const list = this.geos.get(key) ?? [];
        const existing = list.findIndex((item) => item.member === member);
        if (existing >= 0)
            list[existing] = { member, longitude, latitude };
        else
            list.push({ member, longitude, latitude });
        this.geos.set(key, list);
        return 1;
    }
    async georadius(key, longitude, latitude, radius, unit, ..._rest) {
        const list = this.geos.get(key) ?? [];
        const km = unit === 'm' ? radius / 1000 : radius;
        return list
            .map((item) => {
            const distance = haversineKm(latitude, longitude, item.latitude, item.longitude);
            return { item, distance };
        })
            .filter((entry) => entry.distance <= km)
            .map((entry) => [
            entry.item.member,
            entry.distance.toFixed(3),
            [String(entry.item.longitude), String(entry.item.latitude)],
        ]);
    }
    async geopos(key, member) {
        const item = (this.geos.get(key) ?? []).find((entry) => entry.member === member);
        if (!item) {
            return [null];
        }
        return [[String(item.longitude), String(item.latitude)]];
    }
    pipeline() {
        const commands = [];
        const api = {
            geoadd: (key, longitude, latitude, member) => {
                commands.push(() => this.geoadd(key, longitude, latitude, member));
                return api;
            },
            expire: (key, seconds) => {
                commands.push(() => this.expire(key, seconds));
                return api;
            },
            set: (key, value, mode, ttl) => {
                commands.push(() => this.set(key, value, mode, ttl));
                return api;
            },
            del: (...keys) => {
                commands.push(() => this.del(...keys));
                return api;
            },
            hset: (key, data) => {
                commands.push(() => this.hset(key, data));
                return api;
            },
            zrem: (key, ...members) => {
                commands.push(() => this.zrem(key, ...members));
                return api;
            },
            exec: async () => Promise.all(commands.map(async (command) => [null, await command()])),
        };
        return api;
    }
}
exports.MemoryRedis = MemoryRedis;
function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
//# sourceMappingURL=memory-redis.js.map