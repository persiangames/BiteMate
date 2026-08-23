import { AsyncLocalStorage } from 'node:async_hooks';
export interface RequestStore {
    requestId: string;
    userId?: string;
}
export declare const requestContext: AsyncLocalStorage<RequestStore>;
export declare function getRequestId(): string | undefined;
export declare function getRequestUserId(): string | undefined;
