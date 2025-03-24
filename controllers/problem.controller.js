const express = require('express');
const router = express.Router();
const Problem = require('../models/problems.model');

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Problem.findById(id).populate('best_author').lean().exec();
        if (!data) {
            return res.status(500).json({ success: false, msg: 'Error Fetching Data' });
        }
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: 'Error Fetching Data', error: e });
    }
});

router.get('/get/all', async (req, res) => {
    try {
        const data = await Problem.find().populate('best_author').lean().exec();
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: 'Error Fetching Data', error: e });
    }
});

module.exports = router;