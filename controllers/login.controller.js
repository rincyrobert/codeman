const tokenize = require('./signup.controller').tokenize;
const User = require('../models/user.model');

module.exports = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(500).send({ success: false, msg: 'Email or password is required' });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(200).send({ success: false, msg: 'User Not Found' });
        }
        
        const match = user.checkPassword(req.body.password);
        if (!match) {
            return res.status(500).send({ msg: "email or password is incorrect" });
        }
        const token = tokenize(user);
        return res.status(200).send({ success: true, user, token });
    } catch (e) {
        return res.status(500).json({ success: false, msg: 'Error', error: e });
    }
};