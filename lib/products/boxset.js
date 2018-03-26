'use strict';

const BLU_RAY = 'blu-ray';
const BOXSET = 'box-set';

class Boxset {
  constructor(data) {
    this._seasonNumber = data.seasonNumber;
    this._year = data.year;
    this._showName = data.showName;
  }

  static isMatch(data) {
    return data.productType === BLU_RAY && data.kind === BOXSET;
  }

  getTitle() {
    return `${this._showName} (Season ${this._seasonNumber})`;
  }

  getSubtitle() {
    return this._year;
  }
}

module.exports = Boxset;
