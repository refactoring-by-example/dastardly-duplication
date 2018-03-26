'use strict';

const BOOK = 'book';
const NON_FICTIONAL_BOOK = 'non-fiction';

class NonFictionalBook {
  constructor(data) {
    this._bookTitle = data.bookTitle;
    this._author = data.author;
    this._year = data.year;
  }

  static isMatch(data) {
    return data.productType === BOOK && data.kind === NON_FICTIONAL_BOOK;
  }

  getTitle() {
    return this._bookTitle;
  }

  getSubtitle() {
    return `${this._author} (${this._year})`;
  }
}

module.exports = NonFictionalBook;
