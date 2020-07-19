const credentials = require("./credentials");
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const KoaBody = require("koa-bodyparser");
const KoaJSON = require("koa-json");
const KoaCORS = require("@koa/cors");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const PORT = credentials.PORT;
const app = new Koa();
const router = new KoaRouter();
const errorResponse = (ctx, error) => ctx.body = { status: 400, message: error.message };
const api = axios.create({ baseURL: process.env.API_URL });

router.get("/apitest/:symbol", async ctx => {
    try {
        let { data } = await test.get(`${ctx.params.symbol}/`);
        let c = cheerio.load(data);
        let unrefinedPrice = c(".current-price").text();
        let priceCheck = /([0-9\.\,]+).+/
        let refinedPrice = unrefinedPrice.replace(priceCheck, "$1").replace(",", "");
        let price = Number(refinedPrice)

        ctx.body = { status: 200, data: { symbol: ctx.params.symbol, price }};
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
