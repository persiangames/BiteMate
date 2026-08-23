export interface ApiErrorResponse {
    statusCode: number;
    message: string | string[];
    error?: string;
    timestamp: string;
    path: string;
    requestId?: string;
}
export interface ApiSuccessResponse<T> {
    data: T;
    timestamp: string;
}
//# sourceMappingURL=api-response.types.d.ts.map