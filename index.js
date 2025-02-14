const express = require('express');
const app = express();
const connection = require('./config/db');
const probelmController = require('./controllers/problem.controller');

// app.use(express.json());

app.use('/problems', probelmController);


app.listen(3003, async function () {
    await connection();
    console.log('listening on PORT 3003, DB Connected!!');
});