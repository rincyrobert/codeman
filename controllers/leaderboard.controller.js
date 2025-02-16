const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const LeaderBoard = require('../models/leaderboard.model');


router.get('/getbyproblem/:problemId', async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const data = await LeaderBoard.findOne({problem: problemId}).lean().exec();
        if (!data) {
            return res.status(505).json({success: false, msg: 'Error Fetching Data'});
        }
        return res.status(200).json(data);
    } catch (e) {
        return res.status(505).json({success: false, msg: 'Error Fetching Data', error: e});
    }
});

router.post('/getbyproblem/:problemId', async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const userId = req.params.userId;
        const frontEndTime = req.body.newtime;
        const LeaderData = await LeaderBoard.findOne({problem: problemId}).lean().exec();
        if (!LeaderData) {
            const data = await LeaderBoard.create({
                    problem: problemId,
                    author: userId,
                    time: frontEndTime,
                }, {
                    timestamps: true
                }
            );
            return res.status(200).json(data);
        }
        if (frontEndTime < LeaderData.time) {
            const data = await LeaderBoard.updateOne({problem: problemId}, {
                $set: {
                    author: userId,
                    time: frontEndTime
                }
            });
            return res.status(200).json(data);
        } else {
            return res.status(200).json({success: false, msg: 'time is not best time'});
        }

    } catch (e) {
        return res.status(505).json({success: false, msg: 'Error Posting Data', error: e});
    }
});

module.exports = router;