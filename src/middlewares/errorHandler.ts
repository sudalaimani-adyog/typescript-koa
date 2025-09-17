import { Context, Next } from "koa";
import { errorResponse } from "../utils/response";

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next(); // execute downstream middleware / routes
  } catch (err: any) {
    console.error("Unhandled error:", err);

    // Use errorResponse helper
    errorResponse(
      ctx,
      err.status || 500,
      err.message || "Internal Server Error",
      err
    );
  }
};
