'use strict'

const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const dataFetcher = require('../lib/dataFetcher');
const dao = require('../lib/dao');

const sandbox = sinon.sandbox.create();

const metadataHost = 'http://store.metadata.api.co.uk';
const stocksHost = 'http://stock.api.co.uk';
const recsHost = 'http://recs.api.co.uk';

function defaultNocks() {
    nock(metadataHost)
        .get('/dvds')
        .reply(200, [
            {
                id: '124',
                title: 'dvd title',
                genre: 'film',
                director: 'some director',
                credits: [],
                releaseDate: '10-02-2007'
            }
        ]);

    nock(metadataHost)
        .get('/bluerays')
        .reply(200, [
            {
                id: '125',
                title: 'blue-ray title',
                genre: 'film',
                director: 'some director',
                credits: [],
                releaseDate: '10-02-2007'
            },
            {
                id: '130',
                title: 'blue-ray title 2',
                genre: 'film',
                director: 'some director',
                credits: [],
                releaseDate: '10-02-2007'
            },
            {
                id: '140',
                title: 'blue-ray title 3',
                genre: 'film',
                director: 'some director',
                credits: [],
                releaseDate: '10-02-2007'
            }
        ]);

    nock(metadataHost)
        .get('/bluerays/150')
        .reply(200,
            {
                id: '150',
                title: 'another blue-ray title',
                genre: 'film',
                director: 'some director',
                credits: [],
                releaseDate: '10-03-2007'
            }
        );

    nock(metadataHost)
        .get('/books')
        .reply(200, [
            {
                id: '123',
                title: 'raw title',
                genre: 'fiction',
                author: 'someone',
                isbn10: '1234567898',
                isbn13: '123-1234567898',
                releaseDate: '10-02-2007'
            }
        ]);

    nock(metadataHost)
        .get('/vinyls')
        .reply(200, [
            {
                id: '126',
                albumName: 'Master of puppets',
                artistName: 'metallica',
            },
            {
                id: '127',
                albumName: 'Raining blood',
                artistName: 'Slayer',
            }
        ]);

    nock(metadataHost)
        .get('/blacklist')
        .reply(200, ['127']);

    // stocks 
    nock(stocksHost)
        .get('/item/123')
        .reply(200, {
            id: '123',
            price: 12.0,
            quantity: 1
        });

    nock(stocksHost)
        .get('/item/124')
        .reply(200, {
            id: '124',
            price: 10.0,
            quantity: 3
        });

    nock(stocksHost)
        .get('/item/125')
        .reply(200, {
            id: '125',
            price: 1.0,
            quantity: 100
        });

    nock(stocksHost)
        .get('/item/126')
        .reply(200, {
            id: '126',
            price: 10.0,
            quantity: 1
        });

    nock(stocksHost)
        .get('/item/127')
        .reply(200, {
            id: '127',
            price: 10.0,
            quantity: 1
        });

    nock(stocksHost)
        .get('/item/130')
        .reply(200, {
            id: '130',
            price: 10.0,
            quantity: 1
        });

    nock(stocksHost)
        .get('/item/140')
        .reply(200, {
            id: '140',
            price: 10.0,
            quantity: 1
        });

    nock(stocksHost)
        .get('/item/150')
        .reply(200, {
            id: '150',
            price: 15.0,
            quantity: 10
        });
}

describe('Store Metadata Fetcher', () => {
    beforeEach(() => {
        nock.disableNetConnect();
        nock.cleanAll();
        defaultNocks();

        sandbox.stub(dao, 'save').resolves(null);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('books', () => {
        it('fetches books', async () => {
            await dataFetcher.fetch();
            sinon.assert.calledWith(dao.save, sinon.match({
                title: 'raw title',
                subtitle: 'someone',
                kind: 'fiction'
            }));
        });

        it('yields an error when an API call fails', async () => {
            nock.cleanAll()
            nock(metadataHost)
                .get('/books')
                .reply(500);

            defaultNocks();

            try {
                await dataFetcher.fetch();
            } catch (err) {
                assert.equal(err.message, 'Error: 500');
                return sinon.assert.notCalled(dao.save);
            }
            assert.fail('expected to throw!');
        });

        it('yields an error when writing to the database fails', async () => {
            nock.cleanAll()
            dao.save.rejects(new Error('DB Error!'));

            defaultNocks();

            try {
                await dataFetcher.fetch();
            } catch (err) {
                return assert.equal(err.message, 'DB Error!');
            }
            assert.fail('expected to throw!');
        });
    });

    describe('dvds', () => {
        it('fetches dvds', async () => {
            await dataFetcher.fetch();
            sinon.assert.calledWith(dao.save, sinon.match({
                title: 'dvd title (2007)',
                subtitle: 'some director',
                kind: 'film'
            }));
        });

        it('yields an error when an API call fails', async () => {
            nock.cleanAll()
            nock(metadataHost)
                .get('/dvds')
                .reply(500);

            defaultNocks();

            try {
                await dataFetcher.fetch();
            } catch (err) {
                assert.equal(err.message, 'Error: 500');
                return sinon.assert.notCalled(dao.save);
            }
            assert.fail('expected to throw!');
        });
    });

    describe('blurays', () => {
        it('fetches blueray', async () => {
            await dataFetcher.fetch();
            sinon.assert.calledWith(dao.save, sinon.match({
                title: 'blue-ray title (2007)',
                subtitle: 'some director',
                kind: 'film'
            }));
        });

        it('yields an error when an API call fails', async () => {
            nock.cleanAll()
            nock(metadataHost)
                .get('/bluerays')
                .reply(500);

            defaultNocks();

            try {
                await dataFetcher.fetch();
            } catch (err) {
                assert.equal(err.message, 'Error: 500');
                return sinon.assert.notCalled(dao.save);
            }
            assert.fail('expected to throw!');
        });
    });

    describe('vinyls', () => {
        it('fetches vinyls', async () => {
            await dataFetcher.fetch();
            sinon.assert.calledWith(dao.save, sinon.match({
                title: 'Master of puppets',
                subtitle: 'metallica'
            }));
        });

        it('yields an error when an API call fails', async () => {
            nock.cleanAll();
            nock(metadataHost)
                .get('/vinyls')
                .reply(500);

            defaultNocks();

            try {
                await dataFetcher.fetch();
            } catch (err) {
                assert.equal(err.message, 'Error: 500');
                return sinon.assert.notCalled(dao.save);
            }
            assert.fail('expected to throw!');
        });
    });

    describe('Blacklisting', () => {
        it('exclude products that are blacklisted', async () => {
            defaultNocks();

            await dataFetcher.fetch();

            sinon.assert.neverCalledWithMatch(dao.save, sinon.match({
                id: '127'
            }));
        });
    });

    describe('Stocks', () => {
        it('appends stock and price', async () => {
            await dataFetcher.fetch();
            sinon.assert.calledWith(dao.save, sinon.match({
                title: 'Master of puppets',
                subtitle: 'metallica',
                price: 10,
                quantity: 1
            }));
        });
    });
});
