const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    hashed_password: {
        type: String,
        required: true,
    },
    attended_problems: [{ type: Schema.Types.ObjectId, ref: 'problems' }],
});


module.exports = mongoose.model('user', userSchema);