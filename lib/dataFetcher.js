
function createTitles() {
}
const _ = require('lodash');
const async = require('async');
const request = require('request').defaults({ json: true });
const utils = require('util');
const getTitles = require('./titles');
const dao = require('./dao');

request['get'] = utils.promisify(request.get);

const metadataHost = 'http://store.metadata.api.co.uk';
const stocksHost = 'http://stock.api.co.uk';

const defaultMapping = {
    genre: 'kind',
    releaseDate: 'year'
};

const bookMapping = {
    defaultMapping,
    title: 'bookTitle'
};

const resolvers = {
    releaseDate: (to) => {
        return new Date(to.releaseDate).getFullYear()
    }
};

function resolveKey(key, mapping) {
    const override = mapping[key];
    if (override) {
        return override;
    }
    return key;
}

function resolveValue(key, source) {
    const fn = resolvers[key];
    if (fn) {
        return fn(source);
    }
    return source[key];
}

function createTitles(type, to) {
    const productDetails = {
        productType: type
    };
    for (const key of Object.keys(to)) {
        const mapping = type === 'book' ? bookMapping : defaultMapping;
        let mappedKey = resolveKey(key, mapping);
        productDetails[mappedKey] = resolveValue(key, to);
    }
    return getTitles(productDetails);
}

function convert(type, to) {
    const { id, genre } = to;
    const { title, subtitle } = createTitles(type, to);
    const model = {
        id,
        type,
        title,
        subtitle,
    }
    if (genre) {
        model.kind = genre;
    }

    return model;
}

async function get(url) {
    const res = await request.get(url);
    if (res.statusCode >= 400) {
        throw new Error(`Error: ${res.statusCode}`);
    }
    return res.body;
}

function filterByBlacklist(products, blacklist) {
    return _.reject(products, (product) => {
        return _.includes(blacklist, product.id);
    });
}

function createProducts(productSourceData) {
    let products = [];
    for (const productType of Object.keys(productSourceData)) {
        const items = productSourceData[productType];
        products.push(items.map(_.partial(convert, productType)));
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
        book: get(metadataHost + '/books'),
        dvd: get(metadataHost + '/dvds'),
        'blu-ray': get(metadataHost + '/bluerays'),
        'vinyl-record': get(metadataHost + '/vinyls')
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
    return Promise.all(products.map((product) => get(stocksHost + `/item/${product.id}`)));
}

function merge(products, stocks) {
    for (const [i, product] of products.entries()) {
        product.price = stocks[i].price;
        product.quantity = stocks[i].quantity;
    }
    return products;
}

module.exports.fetch = async () => {
    const [blacklist, productSourceData] = await Promise.all([get(metadataHost + '/blacklist'), getProductData()]);

    const products = createProducts(productSourceData);
    const filteredProducts = filterByBlacklist(products, blacklist);
    const stocks = await getStockData(filteredProducts);
    return await Promise.all(merge(filteredProducts, stocks).map(dao.save));
};
