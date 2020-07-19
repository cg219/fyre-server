const credentials = require("./credentials");
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const KoaBody = require("koa-bodyparser");
const KoaJSON = require("koa-json");
const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");
const path = require("path");
const PORT = credentials.PORT;
const LOOKUP_BUFFER = 15000;
const app = new Koa();
const router = new KoaRouter();
const errorResponse = (ctx, error) => ctx.body = { status: 400, message: error.message };
const api = axios.create({ baseURL: process.env.API_URL });

const initFirestore = () => {
    const buffer = Buffer.from(credentials.FIREBASE_SERVICE_ACCOUNT, "base64");
    const auth = JSON.parse(buffer.toString("utf-8"));

    admin.initializeApp({ credential: admin.credential.cert(auth) });

    return admin.firestore();
}

const checkStore = async (symbol) => {
    try {
        const stock = await firestore.collection("stocks").doc(symbol).get();

        if (stock.exists) {
            return stock.data();
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}

const fetchStock = async (symbol) => {
    try {
        let { data } = await api.get(`${symbol}/`);
        let c = cheerio.load(data);
        let unrefinedPrice = c(".current-price").text();
        let priceCheck = /([0-9\.\,]+).+/
        let refinedPrice = unrefinedPrice.replace(priceCheck, "$1").replace(",", "");

        return Number(refinedPrice);

    } catch (error) {
        console.error(error);
        throw Error("Stock Not Found");
    }
}

const storeStock = async (symbol, price) => {
    try {
        const stock = {
            symbol,
            price,
            date: Date.now()
        }

        const doc = await firestore.collection("stocks").doc(symbol).set(stock);

        return true;
    } catch (error) {
        console.error(error);
        throw Error("Error Storing Stock");
    }
}

const firestore = initFirestore();

router.get("/api/:symbol", async ctx => {
    try {
        const symbol = ctx.params.symbol;
        const store = await checkStore(symbol);
        let price;
        let shouldStore = true
        let didStore;

        if (store) {
            if (Date.now() - store.date < LOOKUP_BUFFER) {
                price = store.price;
                shouldStore = false;
            } else {
                price = await fetchStock(symbol);
            }
        } else {
            price = await fetchStock(symbol);
        }

        ctx.body = { status: 200, data: { symbol, price }};

        if (shouldStore) { storeStock(symbol, price) }
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
