const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    attended_problems: [{ type: Schema.Types.ObjectId, ref: 'problems' }],
});


userSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    var hash = bcrypt.hashSync(this.password, 8);
    this.password = hash;
    return next();
});

module.exports = mongoose.model('user', userSchema);