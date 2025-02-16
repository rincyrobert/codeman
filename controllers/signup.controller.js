const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const tokenize = (user) => {
    return jwt.sign({ user }, 'CODEMANJWTSECRET');
}

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(500).send({ success: false, msg: 'Email or password is required' });
        }
        let user = await User.findOne({ email: email });
        if (user) {
            return res.status(200).send({ success: false, msg: 'User already exists' });
        }
        user = await User.create(req.body);
        const token = tokenize(user);
        return res.status(200).send({ success: true, token, user });
    } catch (e) {
        return res.status(500).json({ success: false, msg: 'Error', error: e });
    }
};

module.exports = { register, tokenize };