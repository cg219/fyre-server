const credentials = require("./credentials");
const cron = require("node-cron");
const axios = require("axios");
const { database: firestore, fetchStock, store } = require("./methods");
const api = axios.create({ baseURL: process.env.API_URL });

cron.schedule(credentials.SCHEDULE, async () => {
    console.log("Updating");

    const stocks = await firestore.collection("stocks").get();

    stocks.forEach(async snap => {
        let stock = snap.data();

        try {
            let newPrice = await fetchStock(api, stock.symbol);

            await store(firestore, stock.symbol, newPrice);
        } catch (error) {
            console.error(error)
        }
    })
})
