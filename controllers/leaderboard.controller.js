const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const LeaderBoard = require('../models/leaderboard.model');


router.get('/getbyproblem/:problemId', async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const data = await LeaderBoard.findOne({ problem: problemId }).populate('problem').populate('author').lean().exec();
        if (!data) {
            return res.status(500).json({ success: false, msg: 'Error Fetching Data' });
        }
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: 'Error Fetching Data', error: e });
    }
});

router.get('/getbyproblem', async (req, res) => {
    try {
        const data = await LeaderBoard.find().populate('problem').populate('author').lean().exec();
        if (!data) {
            return res.status(500).json({ success: false, msg: 'Error Fetching Data' });
        }
        return res.status(200).json({ success: true, data });
    } catch (e) {
        return res.status(500).json({ success: false, msg: 'Error Fetching Data', error: e });
    }
});

router.post('/getbyproblem/:problemId', async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const userId = req.params.userId;
        const frontEndTime = req.body.newtime;
        const leaderData = await LeaderBoard.findOne({ problem: problemId }).lean().exec();
        if (!leaderData) {
            const data = await LeaderBoard.create({
                problem: problemId,
                author: userId,
                time: frontEndTime,
            });
            return res.status(200).json({ success: true, data });
        }
        if (frontEndTime < leaderData.time) {
            const data = await LeaderBoard.updateOne({ problem: problemId }, {
                $set: {
                    author: userId,
                    time: frontEndTime
                }
            });
            return res.status(200).json({ success: true, data });
        } else {
            return res.status(200).json({ success: false, msg: 'time is not best time' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, msg: 'Error Posting Data', error: e });
    }
});

module.exports = router;