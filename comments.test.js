const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/usersShemaModel');
const Comment = require('./models/comments');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 });
});

it("échoue si les champs sont manquants", async () => {
  const res = await request(app).put("/comments/likeComment").send({});
  expect(res.body.result).toBe(false);
  expect(res.body.error).toBe("Champs manquants.");
});

it("échoue si le commentaire n'existe pas", async () => {
  const token = `tok_${Math.random()}`;
  const res = await request(app).put("/comments/likeComment").send({
    token,
    commentId: "000000000000000000000000"
  });

  expect(res.body.result).toBe(false);
  expect(res.body.error).toBe("Commentaire introuvable.");
});

it("ajoute un like si l'utilisateur n'a pas encore liké", async () => {
  const token = `tok_${Math.random()}`;

  const comment = await Comment.create({ author: null, content: "Test", isLike: [] });

  const res = await request(app).put("/comments/likeComment").send({
    token,
    commentId: comment._id
  });

  expect(res.body.result).toBe(true);
  expect(res.body.liked).toBe(true);
  expect(res.body.likeCount).toBe(1);

  const updatedComment = await Comment.findById(comment._id);
  expect(updatedComment.isLike.length).toBe(1);
  expect(updatedComment.isLike[0]).toBe(token);
});

it("retire un like si l'utilisateur avait déjà liké", async () => {
  const token = `tok_${Math.random()}`;

  const comment = await Comment.create({ author: null, content: "Test", isLike: [token] });

  const res = await request(app).put("/comments/likeComment").send({
    token,
    commentId: comment._id
  });

  expect(res.body.result).toBe(true);
  expect(res.body.liked).toBe(false);
  expect(res.body.likeCount).toBe(0);

  const updatedComment = await Comment.findById(comment._id);
  expect(updatedComment.isLike.length).toBe(0);
});

afterAll(async () => {
  await mongoose.connection.close();
});