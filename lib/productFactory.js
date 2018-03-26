'use strict';

const Filehound = require('filehound');
const path = require('path');

const FictionalBook = require('./products/fictionalBook');

const PRODUCTS = Filehound.create()
  .path(path.join(__dirname, './products'))
  .not()
  .match('*fictionalBook*') // exclude the default product
  .findSync()
  .map((product) => require(product));

module.exports = (data) => {
  const matches = PRODUCTS.filter(product => product.isMatch(data));
  const Product = matches[0] || FictionalBook;

  return new Product(data);
};
