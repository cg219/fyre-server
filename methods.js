const credentials = require("./credentials");
const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");

const database = () => {
    const buffer = Buffer.from(credentials.FIREBASE_SERVICE_ACCOUNT, "base64");
    const auth = JSON.parse(buffer.toString("utf-8"));

    admin.initializeApp({ credential: admin.credential.cert(auth) });

    return admin.firestore();
}

const checkStore = async (db, symbol) => {
    try {
        const stock = await db.collection("stocks").doc(symbol).get();

        if (stock.exists) {
            return stock.data();
        }

        return {}
    } catch (error) {
        console.error(error);
        return {}
    }
}

const fetchStock = async (api, symbol) => {
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

const store = async (db, symbol, price) => {
    try {
        const stock = {
            symbol,
            price,
            date: Date.now()
        }

        await db.collection("stocks").doc(symbol).set(stock);

        return true
    } catch (error) {
        console.error(error);
        throw Error("Error Storing Stock");
    }
}

module.exports = { database: database(), checkStore, fetchStock, store }
