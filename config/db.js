const mongoose = require('mongoose');

function connection() {
    console.log('starting DB connection....');
    return mongoose.connect('mongodb+srv://jibinbabu966:CPivgm2AIVzzvjVI@codeman.y8nxp.mongodb.net/?retryWrites=true&w=majority&appName=codeMan');
}


module.exports = connection;
