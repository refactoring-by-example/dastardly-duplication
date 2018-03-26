'use strict';

const DVD = 'dvd';
const FILM = 'film';

class DvdFilm {
  constructor(data) {
    this._title = data.title;
    this._year = data.year;
    this._director = data.director;
  }

  static isMatch(data) {
    return data.productType === DVD && data.kind === FILM;
  }

  getTitle() {
    return `${this._title} (${this._year})`;
  }

  getSubtitle() {
    return this._director;
  }
}

module.exports = DvdFilm;
