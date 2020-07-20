const credentials = require("./credentials");
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const KoaBody = require("koa-bodyparser");
const KoaJSON = require("koa-json");
const axios = require("axios");
const { database: firestore, checkStore, fetchCrypto, fetchStock, store } = require("./methods");
const PORT = credentials.PORT;
const app = new Koa();
const router = new KoaRouter();
const errorResponse = (ctx, error) => ctx.body = { status: 400, message: error.message };
const stockAPI = axios.create({ baseURL: process.env.API_URL });
const coinAPI = axios.create({ baseURL: process.env.COIN_URL });

const handleReq = async (api, collection, fetch, context) => {
    try {
        const symbol = context.params.symbol;
        const asset = await checkStore(firestore, symbol, collection);
        let price;
        let shouldStore = true
        let didStore;

        if (asset.price) {
            price = asset.price;
            shouldStore = false;
        } else {
            price = await fetch(api, symbol);
        }

        context.body = { status: 200, data: { symbol, price }};

        if (shouldStore) { store(firestore, symbol, price, collection) }
    } catch (error) {
        errorResponse(context, error);
    }
}

router.get("/api/stock/:symbol", async ctx => {
    await handleReq(stockAPI, "stocks", fetchStock, ctx);
})

router.get("/api/crypto/:symbol", async ctx => {
    await handleReq(coinAPI, "cryptos", fetchCrypto, ctx);
})

app
    .use(KoaBody())
    .use(KoaJSON())
    .use(router.routes())
    .use(router.allowedMethods());

const server = app.listen(PORT);

console.log(`Running on Port: ${PORT}`);

module.exports = server;
