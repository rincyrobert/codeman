const express = require('express');
const app = express();
const connection = require('./config/db');


app.get('/', function (req, res) {
    return res.send('Hello Reshma');
});

app.listen(3003, async function() {
    await connection();
    console.log('listening on 3003, DB Connected');
});