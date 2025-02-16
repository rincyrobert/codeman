const express = require('express');
const app = express();
const connection = require('./config/db');
const probelmController = require('./controllers/problem.controller');
const { register } = require('./controllers/signup.controller');
const login = require('./controllers/login.controller');

app.use(express.json());

app.post('/login', login);
app.post('/signup', register);

app.use('/problems', probelmController);

app.listen(3003, async function () {
    await connection();
    console.log('listening on PORT 3003, DB Connected!!');
});