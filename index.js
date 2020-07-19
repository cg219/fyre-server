const credentials = require("./credentials");
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const KoaBody = require("koa-bodyparser");
const KoaJSON = require("koa-json");
const axios = require("axios");
const { database: firestore, checkStore, fetchStock, store } = require("./methods");
const PORT = credentials.PORT;
const app = new Koa();
const router = new KoaRouter();
const errorResponse = (ctx, error) => ctx.body = { status: 400, message: error.message };
const api = axios.create({ baseURL: process.env.API_URL });

router.get("/api/:symbol", async ctx => {
    try {
        const symbol = ctx.params.symbol;
        const stock = await checkStore(firestore, symbol);
        let price;
        let shouldStore = true
        let didStore;

        if (stock.price) {
            price = stock.price;
            shouldStore = false;
        } else {
            price = await fetchStock(api, symbol);
        }

        ctx.body = { status: 200, data: { symbol, price }};

        if (shouldStore) { store(firestore, symbol, price) }
    } catch (error) {
        errorResponse(ctx, error);
    }
})

app
    .use(KoaBody())
    .use(KoaJSON())
    .use(router.routes())
    .use(router.allowedMethods());

const server = app.listen(PORT);

console.log(`Running on Port: ${PORT}`);

module.exports = server;
