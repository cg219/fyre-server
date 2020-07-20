const credentials = require("./../credentials");
const cron = require("node-cron");
const axios = require("axios");
const { database: firestore, fetchStock, fetchCrypto, store } = require("./../methods");
const stocksAPI = axios.create({ baseURL: process.env.API_URL });
const coinAPI = axios.create({ baseURL: process.env.COIN_URL });

cron.schedule(credentials.SCHEDULE, async () => {
    console.log("Updating");

    const stocks = await firestore.collection("stocks").get();

    stocks.forEach(async snap => {
        let stock = snap.data();

        try {
            let newPrice = await fetchStock(stocksAPI, stock.symbol);

            await store(firestore, stock.symbol, newPrice, "stocks");
        } catch (error) {
            console.error(error)
        }
    })
})

cron.schedule("30 * * * * *", async () => {
    console.log("Updating");

    const cryptos = await firestore.collection("cryptos").get();

    cryptos.forEach(async snap => {
        let crypto = snap.data();

        try {
            let newPrice = await fetchCrypto(coinAPI, crypto.symbol);

            await store(firestore, crypto.symbol, newPrice, "cryptos");
        } catch (error) {
            console.error(error)
        }
    })
})
