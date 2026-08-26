import * as dns from 'node:dns';

/** Prefer IPv4 for SMTP on hosts (e.g. Render) without working IPv6 egress. */
export function smtpIpv4Lookup(
  hostname: string,
  _options: unknown,
  callback: (err: NodeJS.ErrnoException | null, address: string, family?: number) => void,
): void {
  dns.lookup(hostname, { family: 4 }, callback);
}
