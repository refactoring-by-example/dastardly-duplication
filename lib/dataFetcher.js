const _ = require('lodash');
const async = require('async');
const request = require('request').defaults({ json: true });
const utils = require('util');
const getTitles = require('./titles');
const dao = require('./dao');

request['get'] = utils.promisify(request.get);

const metadataHost = 'http://store.metadata.api.co.uk';
const stocksHost = 'http://stock.api.co.uk';

const CONCURRENCY_LEVEL = 10;

const converters = {
    book: toBook,
    dvd: toDvd,
    bluray: toBlueray,
    vinyl: toVinyl
};

async function getBlacklist() {
    const res = await request.get(metadataHost + '/blacklist');
    if (res.statusCode >= 400) {
        return new Error(`Error: ${res.statusCode}`);
    }
    return res.body;
}

async function getBooks() {
    const res = await request.get(metadataHost + '/books');
    if (res.statusCode >= 400) {
        throw new Error(`Error: ${res.statusCode}`);
    }
    return res.body;
}

async function getDvds() {
    const res = await request.get(metadataHost + '/dvds');
    if (res.statusCode >= 400) {
        throw new Error(`Error: ${res.statusCode}`);
    }
    return res.body;
}

async function getBlurays() {
    const res = await request.get(metadataHost + '/bluerays');
    if (res.statusCode >= 400) {
        throw new Error(`Error: ${res.statusCode}`);
    }
    return res.body;
}

async function getStocks(id) {
    const res = await request.get(stocksHost + `/item/${id}`);
    if (res.statusCode >= 400) {
        throw new Error(`Error: ${res.statusCode}`);
    }
    return res.body;
}

async function getVinyls() {
    const res = await request.get(metadataHost + '/vinyls');
    if (res.statusCode >= 400) {
        throw new Error(`Error: ${res.statusCode}`);
    }
    return res.body;
}

function toBook(to) {
    const titles = getTitles({
        productType: 'book',
        bookTitle: to.title,
        kind: to.genre,
        author: to.author
    });
    return {
        id: to.id,
        type: 'book',
        title: titles.title,
        subtitle: titles.subtitle,
        kind: to.genre
    }
}

function toDvd(to) {
    const titles = getTitles({
        productType: 'dvd',
        title: to.title,
        kind: to.genre,
        director: to.director,
        year: new Date(to.releaseDate).getFullYear()
    });
    return {
        id: to.id,
        type: 'dvd',
        title: titles.title,
        subtitle: titles.subtitle,
        kind: to.genre
    }
}

function toBlueray(to) {
    const titles = getTitles({
        productType: 'blu-ray',
        title: to.title,
        kind: to.genre,
        director: to.director,
        year: new Date(to.releaseDate).getFullYear()
    });
    return {
        id: to.id,
        type: 'blu-ray',
        title: titles.title,
        subtitle: titles.subtitle,
        kind: to.genre
    }
}

function toVinyl(to) {
    const titles = getTitles({
        productType: 'vinyl-record',
        albumName: to.albumName,
        artistName: to.artistName,
    });
    return {
        id: to.id,
        type: 'vinyl-record',
        title: titles.title,
        subtitle: titles.subtitle
    }
}

function filterByBlacklist(products, blacklist) {
    return _.reject(products, (product) => {
        return _.includes(blacklist, product.id);
    });
}

function createProducts(productSourceData) {
    let products = [];
    for (const productType of Object.keys(productSourceData)) {
        const toProduct = converters[productType];
        const items = productSourceData[productType];
        products.push(items.map(toProduct));
    }
    return _.flatten(products);
}

async function reduce(iterable, fn, initial) {
    let accumulator = initial;
    for (const item of iterable) {
        accumulator = await fn(accumulator, item);
    }
    return accumulator;
}

async function getProductData() {
    const requests = {
        book: getBooks(),
        dvd: getDvds(),
        bluray: getBlurays(),
        vinyl: getVinyls()
    };

    await Promise.all(Object.values(requests));

    const productSourceData = Promise.resolve({})
    const keys = Object.keys(requests);
    return reduce(keys, async (acc, key) => {
        acc[key] = await requests[key];
        return acc;
    }, {});
}

async function getStockData(products) {
    return Promise.all(products.map((product) => getStocks(product.id)));
}

function merge(products, stocks) {
    for (const [i, product] of products.entries()) {
        product.price = stocks[i].price;
        product.quantity = stocks[i].quantity;
    }
    return products;
}

module.exports.fetch = async () => {
    const [blacklist, productSourceData] = await Promise.all([getBlacklist(), getProductData()]);

    const products = createProducts(productSourceData);
    const filteredProducts = filterByBlacklist(products, blacklist);
    const stocks = await getStockData(filteredProducts);
    return await Promise.all(merge(filteredProducts, stocks).map(dao.save));
};
