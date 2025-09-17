import Koa from 'koa';
import bodybarser from 'koa-bodyparser';
import studuentRouter from "./routes/studentRouter";
import attendanceRouter from "./routes/attendance";
import { errorHandler } from './middlewares/errorHandler';
import { asyncConnect } from './database/database';

const app = new Koa();

app.use(bodybarser());

const port: number = 8000;

app.use(async (ctx, next) => {
    console.log(`--> ${ctx.method} ${ctx.url}`);
    await next();
    console.log(`<-- ${ctx.method} ${ctx.url} ${ctx.status}`);
});

app.use(errorHandler)

app.use(studuentRouter.routes()).use(studuentRouter.allowedMethods());
app.use(attendanceRouter.routes()).use(attendanceRouter.allowedMethods());


asyncConnect().then(() => {
    app.listen(8000, async () => {
        await asyncConnect();
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error);
})