const request = require('supertest');
const app = require('./app')
//const mongoose = require('mongoose');
//require('dotenv').config();
const externalBooks = require('./models/externalBooks') 
const Book = require('./models/books')

global.fetch = jest.fn()
/*
beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 });
});
*/
it('no title in body : 400', async () => {
  const res = await request(app).post('/externalBooks/addBookByTitle').send({ title: null});
  expect(res.statusCode).toBe(400);
  expect(res.body.result).toBe(false)
})

it('fetch failed : 502', async () => {
  fetch.mockResolvedValueOnce({status : 500})
  const res = await request(app).post('/externalBooks/addBookByTitle').send({title: 'Candide'})
  expect(res.status).toBe(502); 
  expect(res.body.result).toBe(false);
});

it('no book found', async () => {
  fetch.mockResolvedValueOnce({
    status : 200,
    json: async () => ({result: []})
    })
  const res = await request(app).post('/externalBooks/addBookByTitle').send({title: 'Livre inconnu'})
  expect(res.status).toBe(200); 
  expect(res.body.result).toBe(false);
});

it('no french version available', async () => {
    fetch.mockResolvedValueOnce({
    status : 200,
    json: async () => ({result: [{id:1, languages: ['en'], title: 'BookEN', }]})
    })
    const res = await request(app).post('/externalBooks/addBookByTitle').send({title: 'Livre inconnu'})
    expect(res.status).toBe(200); 
    expect(res.body.result).toBe(false);
})

it('book already in DB', async () => {
    fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
            results: [{gutendexId: 1, languages: ['fr'], title: 'Candide', authors: [{ name: 'Author' }]}]
        }),
    });
    jest.spyOn(externalBooks, 'findOne').mockResolvedValueOnce({ gutendexId: 1 });
    const res =  await request(app).post('/externalBooks/addBookByTitle').send({title: 'Candide'})
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(false);
});

it('should save book if everything is correct', async () => {
    fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
            results: [{ gutendexId: 1, languages: ['fr'], title: 'Livre FR', authors: [{ name: 'Author' }], summaries: ['Résumé'] }]
        }),
    });
    jest.spyOn(externalBooks, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(Book, 'countDocuments').mockResolvedValueOnce(3);
    jest.spyOn(externalBooks.prototype, 'save').mockResolvedValueOnce({
        gutendexId: 1,
        title: 'Livre FR',
        author: 'Author',
        synopsis: 'Résumé',
        fragmentsRequired: 4,
        fragmentsCollected: 0,
    });

    const res =  await request(app).post('/externalBooks/addBookByTitle').send({title: 'Candide'})
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
});
/*
afterAll(async () => {
  await mongoose.connection.close();
});*/


