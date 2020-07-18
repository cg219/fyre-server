const credentials = require("./credentials");
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const KoaBody = require("koa-bodyparser");
const KoaJSON = require("koa-json");
const KoaCORS = require("@koa/cors");
const axios = require("axios");
const path = require("path");
const PORT = credentials.PORT;
const app = new Koa();
const router = new KoaRouter();
const errorResponse = (ctx, error) => ctx.body = { status: 400, message: error.message };
const api = axios.create({ baseURL: process.env.API_URL });

router.get("/api/:symbol", async ctx => {
    try {
        let price = await api.get("quote", { params: { symbol: ctx.params.symbol.toUpperCase(), token: credentials.FINNHUB_TOKEN } });

        if (price.data.error) {
            errorResponse(ctx, { message: price.data.error});
        } else {
            ctx.body = { status: 200, data: { symbol: ctx.params.symbol.toUpperCase(), price: price.data.c } }
        }
    } catch (error) {
        errorResponse(ctx, error);
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
