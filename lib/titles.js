'use strict';

const getProduct = require('./productFactory');

module.exports = (data) => {
  const product = getProduct(data);

  return {
    title: product.getTitle(),
    subtitle: product.getSubtitle()
  };
};
