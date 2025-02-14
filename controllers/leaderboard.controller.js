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
        const frontEndTime = req.body.newtime;
        const LeaderData = await LeaderBoard.findOne({problem: problemId}).lean().exec();
        if (!LeaderData) {
            return res.status(505).json({success: false, msg: 'Document not found'});
        }
        if (frontEndTime < LeaderData.time) {
            // update user and time in leaderBoard data for this problem
            // hint: you need to get userId like we did for  frontEndTime
            // use .updateOne function from mongoose
        } else {
            return res.status(200).json({success: false, msg: 'time is not best time'});
        }

    } catch (e) {
        return res.status(505).json({success: false, msg: 'Error Posting Data', error: e});
    }
});

module.exports = router;