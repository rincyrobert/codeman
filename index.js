const express = require('express');
const cors = require('cors');
const app = express();
const connection = require('./config/db');
const probelmController = require('./controllers/problem.controller');
const LeaderBoardController = require('./controllers/leaderboard.controller');
const { register } = require('./controllers/signup.controller');
const login = require('./controllers/login.controller');
const path = require('path');
app.use('/vs', express.static(path.join(__dirname, 'node_modules/monaco-editor/min/vs')));

app.use(express.json());
app.use(cors());

app.post('/login', login);
app.post('/signup', register);

app.use('/problems', probelmController);
app.use('/leader', LeaderBoardController);

app.listen(3003, async function () {
    await connection();
    console.log('listening on PORT 3003, DB Connected!!');
});