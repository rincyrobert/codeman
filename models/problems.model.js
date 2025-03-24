const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const problemSchema = new Schema({
    problem_header: {
        type: String,
    },
    problem_description: {
        type: String,
    },
    test_cases: [],
    difficulty_level: {
        type: String,
        enum: ['low', 'medium', 'hard'],
        default: 'medium',
    },
    best_time: {
        type: String,
        required: false,
    },
    best_author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    },
    defaultCode: {
        type: String,
    },
    timeLimit: {
        type: Number,
    }
});

module.exports = mongoose.model('problem', problemSchema);