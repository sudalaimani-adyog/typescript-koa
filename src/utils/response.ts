import { Context } from "koa";

export const successResponse = <T = any>(
    ctx: Context,
    statusCode: number,
    message: string,
    data: T | null = null
): void => {
    ctx.status = statusCode;
    ctx.body = {
        statusCode,
        message,
        data,
    };
};

export const errorResponse = (
    ctx: Context,
    statusCode: number,
    message: string,
    error: unknown = null
): void => {
    ctx.status = statusCode;
    ctx.body = {
        statusCode,
        message,
        error,
    };
};
