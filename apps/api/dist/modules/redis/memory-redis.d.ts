import { EventEmitter } from 'node:events';
export declare class MemoryRedis extends EventEmitter {
    private readonly strings;
    private readonly geos;
    private readonly zsets;
    status: string;
    private alive;
    connect(): Promise<this>;
    quit(): Promise<string>;
    ping(): Promise<string>;
    duplicate(): MemoryRedis;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode?: string, ttl?: number): Promise<string>;
    del(...keys: string[]): Promise<number>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    pexpire(key: string, ms: number): Promise<number>;
    ttl(key: string): Promise<number>;
    pttl(key: string): Promise<number>;
    zadd(key: string, score: number, member: string): Promise<number>;
    zrangebyscore(key: string, min: number | string, max: number | string, ...rest: Array<string | number>): Promise<string[]>;
    zrem(key: string, ...members: string[]): Promise<number>;
    hincrby(key: string, field: string, increment: number): Promise<number>;
    hset(key: string, data: Record<string, string> | string, value?: string): Promise<number>;
    hgetall(key: string): Promise<Record<string, string>>;
    geoadd(key: string, longitude: number, latitude: number, member: string): Promise<number>;
    georadius(key: string, longitude: number, latitude: number, radius: number, unit: string, ..._rest: string[]): Promise<Array<[string, string, [string, string]]>>;
    geopos(key: string, member: string): Promise<Array<[string, string] | null>>;
    pipeline(): {
        geoadd: (key: string, longitude: number, latitude: number, member: string) => any;
        expire: (key: string, seconds: number) => any;
        set: (key: string, value: string, mode?: string, ttl?: number) => any;
        del: (...keys: string[]) => any;
        hset: (key: string, data: Record<string, string>) => any;
        zrem: (key: string, ...members: string[]) => any;
        exec: () => Promise<unknown[][]>;
    };
}
