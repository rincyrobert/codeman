const express = require('express');
const router = express.Router();
const Submission = require('../models/submission.model'); // Import the Submission model

// GET /profile/:username
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch recent submissions for the user
    const recentSubmissions = await Submission.find({ username })
      .sort({ submittedAt: -1 }) // Sort by most recent
      .limit(5); // Limit to the last 5 submissions

    // Calculate user progress (e.g., challenges completed, average time, etc.)
    const totalChallengesCompleted = await Submission.countDocuments({ username });
    const easyCompleted = await Submission.countDocuments({ username, difficulty: 'easy' });
    const mediumCompleted = await Submission.countDocuments({ username, difficulty: 'medium' });
    const hardCompleted = await Submission.countDocuments({ username, difficulty: 'hard' });

    // Send the data to the frontend
    res.status(200).json({
      success: true,
      data: {
        recentSubmissions,
        totalChallengesCompleted,
        easyCompleted,
        mediumCompleted,
        hardCompleted,
      },
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile data.' });
  }
});

module.exports = router;