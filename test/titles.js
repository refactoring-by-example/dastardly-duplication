'use strict';

const assert = require('assert');
const getTitles = require('../lib/titles');

const BOOK = 'book';
const BLU_RAY = 'blu-ray';
const VINYL_RECORD = 'vinyl-record';
const DIGITAL_VIDEO_DISC = 'dvd';

describe('Titles', () => {
  describe('when the type is fictional book', () => {
    let titles;
    const bookTitle = 'Charles Dickens';
    const author = 'A Tale of Two Cities';
    const kind = 'fiction';

    beforeEach(() => {
      titles = getTitles({
        productType: BOOK,
        kind,
        bookTitle,
        author
      });
    });

    it('returns the book title as the title', () => {
      assert.equal(titles.title, bookTitle);
    });

    it('returns the author as the subtitle', () => {
      assert.equal(titles.subtitle, author);
    });
  });

  describe('when the type is a non-fictional book', () => {
    let titles;
    const author = 'Douglas Crockford';
    const bookTitle = 'Javascript the good parts';
    const year = '2008';
    const kind = 'non-fiction';

    beforeEach(() => {
      titles = getTitles({
        productType: BOOK,
        kind,
        bookTitle,
        author,
        year: year
      });
    });

    it('returns the book title as the title', () => {
      assert.equal(titles.title, bookTitle);
    });

    it('returns author and year as the subtitle', () => {
      assert.equal(titles.subtitle, `${author} (${year})`);
    });
  });

  describe('when the type is a travel guide', () => {
    let titles;
    const city = 'Berlin';
    const publisher = 'Lonely Planet';
    const year = '2016';
    const kind = 'travel-guide';

    beforeEach(() => {
      titles = getTitles({
        productType: BOOK,
        kind,
        city,
        publisher,
        year
      });
    });

    it('returns the publisher and city as the title', () => {
      assert.equal(titles.title, `${publisher}: ${city}`);
    });

    it('returns the year as the subtitle', () => {
      assert.equal(titles.subtitle, year);
    });
  });

  describe('when the type is a Blu-ray film', () => {
    let titles;
    const title = 'Predator';
    const year = '1987';
    const director = 'John McTiernan';
    const kind = 'film';

    beforeEach(() => {
      titles = getTitles({
        productType: BLU_RAY,
        title,
        year,
        director,
        kind
      });
    });

    it('returns the film title and year as the title', () => {
      assert.equal(titles.title, `${title} (${year})`);
    });

    it('returns the director as the subtitle', () => {
      assert.equal(titles.subtitle, director);
    });
  });

  describe('when the type is a Blu-ray box set', () => {
    let titles;
    const showName = 'Game of Thrones';
    const seasonNumber = 6;
    const year = '2016';
    const kind = 'box-set';

    beforeEach(() => {
      titles = getTitles({
        productType: BLU_RAY,
        showName,
        seasonNumber,
        year,
        kind
      });
    });

    it('returns the show and season name as the title', () => {
      assert.equal(titles.title, `${showName} (Season ${seasonNumber})`);
    });

    it('returns the year as the subtitle', () => {
      assert.equal(titles.subtitle, year);
    });
  });

  describe('when the type is a vinyl record', () => {
    let titles;
    const albumName = 'Hardwired... to Self-Destruct';
    const artistName = 'Metallica';

    beforeEach(() => {
      titles = getTitles({
        productType: VINYL_RECORD,
        albumName,
        artistName
      });
    });

    it('returns the album name as the title', () => {
      assert.equal(titles.title, albumName);
    });

    it('returns the artist name as the subtitle', () => {
      assert.equal(titles.subtitle, artistName);
    });
  });

  describe('when the type is a vinyl record', () => {
    let titles;
    const albumName = 'Hardwired... to Self-Destruct';
    const artistName = 'Metallica';

    beforeEach(() => {
      titles = getTitles({
        productType: VINYL_RECORD,
        albumName,
        artistName
      });
    });

    it('returns the album name as the title', () => {
      assert.equal(titles.title, albumName);
    });

    it('returns the artist name as the subtitle', () => {
      assert.equal(titles.subtitle, artistName);
    });
  });

  describe('when the type is a digit video disc', () => {
    let titles;
    const title = 'Edge of Tomorrow (live die repeat)';
    const year = '2014';
    const director = 'Doug Liman';
    const kind = 'film';

    beforeEach(() => {
      titles = getTitles({
        productType: DIGITAL_VIDEO_DISC,
        title,
        year,
        director,
        kind
      });
    });

    it('returns the film title and year as the title', () => {
      assert.equal(titles.title, `${title} (${year})`);
    });

    it('returns the director as the subtitle', () => {
      assert.equal(titles.subtitle, director);
    });
  });
});
