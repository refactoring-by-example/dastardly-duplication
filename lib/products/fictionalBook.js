'use strict';

class FictionalBook {
  constructor(data) {
    this._bookTitle = data.bookTitle;
    this._author = data.author;
  }

  getTitle() {
    return this._bookTitle;
  }

  getSubtitle() {
    return this._author;
  }
}

module.exports = FictionalBook;
