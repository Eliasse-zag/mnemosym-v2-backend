const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/users');
require('dotenv').config();





beforeAll(async () => {
await mongoose.connect(process.env.CONNECTION_STRING, { connectTimeoutMS: 2000 });
});

it('POST /signin', async () => {
 const res = await request(app).post('/users/signin').send({
   username: 'TESTMAN',
   password: 'TESTPASS',
 });
expect(res.statusCode).toBe(200);
});


 it('échoue si l’utilisateur n’existe pas', async () => {
    const res = await request(app).post('/users/signin').send({ 
    username: 'A', 
    password: 'A' 
  });
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('User not found or wrong password');
  });

it('échoue si le mot de passe est incorrect', async () => {
    const hashedPassword = bcrypt.hashSync('motdepasse', 10);
    await User.create({ 
      username: 'A', 
      email: 'A', 
      password: hashedPassword, 
      token: 'abc123' 
    });

    const res = await request(app).post('/users/signin').send({ 
      username: 'A', 
      password: 'mauvais' 
    });
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('User not found or wrong password');
  });

it('réussit si les identifiants sont corrects', async () => {
    const hashedPassword = bcrypt.hashSync('motdepasse', 10);
    await User.create({ 
      username: 'A', 
      email: 'A', 
      password: hashedPassword, 
      token: 'abc123', 
      fragment: 20 
    });

    const res = await request(app).post('/users/signin').send({ 
      username: 'A', 
      password: 'motdepasse' ,
      token: 'abc123',
      fragment: 20
    });
    expect(res.body.result).toBe(true);
    expect(res.body.token).toBe('abc123');
    expect(res.body.fragment).toBe(20);


  });


afterAll(async () => {
await mongoose.connection.close();
});






