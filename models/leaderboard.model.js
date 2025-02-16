const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaderboardSchema = new Schema({
    problem: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true,
        index: true,
        unique: true,
    },
    time: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true,
    },
});

module.exports = mongoose.model('leaderboard', leaderboardSchema);