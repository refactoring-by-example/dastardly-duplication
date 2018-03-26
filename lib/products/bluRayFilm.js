'use strict';

const BLU_RAY = 'blu-ray';
const FILM = 'film';

class BluRayFilm {
  constructor(data) {
    this._title = data.title;
    this._year = data.year;
    this._director = data.director;
  }

  static isMatch(data) {
    return data.productType === BLU_RAY && data.kind === FILM;
  }

  getTitle() {
    return `${this._title} (${this._year})`;
  }

  getSubtitle() {
    return this._director;
  }
}

module.exports = BluRayFilm;
