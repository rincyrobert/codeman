const express = require('express');
const router = express.Router();
const Problem = require('../models/problems.model');

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Problem.findById(id).lean().exec();
        if (!data) {
            return res.status(505).json({success: false, msg: 'Error Fetching Data'});
        }
        return res.status(200).json(data);
    } catch (e) {
        return res.status(505).json({success: false, msg: 'Error Fetching Data', error: e});
    }
});

router.get('/get/all', async (req, res) => {
    try {
        const data = await Problem.find().lean().exec();
        return res.status(200).json(data);
    } catch (e) {
        return res.status(505).json({success: false, msg: 'Error Fetching Data', error: e});
    }
});

module.exports = router;