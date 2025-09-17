import { Context } from "koa";

export const successResponse = (
    ctx: Context,
    statusCode: number,
    message: string,
    data: unknown = null
) => {
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
) => {
    ctx.status = statusCode;
    ctx.body = {
        statusCode,
        message,
        error,
    };
};
