'use strict';

const VINYL = 'vinyl-record';

class Vinyl {
  constructor(data) {
    this._albumName = data.albumName;
    this._artistName = data.artistName;
  }

  static isMatch(data) {
    return data.productType === VINYL;
  }

  getTitle() {
    return this._albumName;
  }

  getSubtitle() {
    return this._artistName;
  }
}

module.exports = Vinyl;
