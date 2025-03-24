const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    challengeId: { type: String, required: true },
    username: { type: String, required: true },
    difficulty: { type: String, required: true },
    timeTaken: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Submission', SubmissionSchema);