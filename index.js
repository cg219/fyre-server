const credentials = require("./credentials");
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const KoaBody = require("koa-bodyparser");
const KoaJSON = require("koa-json");
const KoaCORS = require("@koa/cors");
const path = require("path");
const PORT = credentials.PORT;
const app = new Koa();
const router = new KoaRouter();

const errorResponse = (ctx, error) => ctx.body = { status: 400, message: error.message };

router.get("/", async ctx => {
    try {
        ctx.body = { status: 200, data: {} }
    } catch (error) {
        errorResponse(cta, error);
    }
})

app
    .use(KoaCORS())
    .use(KoaBody())
    .use(KoaJSON())
    .use(router.routes())
    .use(router.allowedMethods());

const server = app.listen(PORT);

console.log(`Running on Port: ${PORT}`);

module.exports = server;
