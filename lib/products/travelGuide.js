'use strict';

const BOOK = 'book';
const TRAVEL_GUIDE = 'travel-guide';

class TravelGuide {
  constructor(data) {
    this._publisher = data.publisher;
    this._city = data.city;
    this._year = data.year;
  }

  static isMatch(data) {
    return data.productType === BOOK && data.kind === TRAVEL_GUIDE;
  }

  getTitle() {
    return `${this._publisher}: ${this._city}`;
  }

  getSubtitle() {
    return this._year;
  }
}

module.exports = TravelGuide;
