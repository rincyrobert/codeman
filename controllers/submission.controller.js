// filepath: c:\Users\reshm\codeman\controllers\submission.controller.js
const express = require('express');
const router = express.Router();
const Submission = require('../models/submission.model'); 

// POST /submit-time
router.post('/', async (req, res) => {
    const { challengeId, username, timeTaken } = req.body;

    if (!challengeId || !username || !timeTaken) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    try {
        const submission = new Submission({
            challengeId,
            username,
            timeTaken,
            submittedAt: new Date(),
        });
        await submission.save();
        res.json({ success: true, message: 'Time submitted successfully!' });
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({ success: false, message: 'Failed to submit time.' });
    }
});
module.exports = router;