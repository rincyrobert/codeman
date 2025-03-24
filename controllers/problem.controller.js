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

router.post('/run-tests', async (req, res) => {
  const { code, testCases } = req.body;
  try {
    // Process each test case
    const results = testCases.map(testCase => {
      try {
        // Execute the Python code with the test case input
        const output = executePythonCode(code, testCase.input);
        const passed = output === testCase.expectedOutput;

        return {
          testCase,
          passed,
          output,
          error: passed ? null : `Expected ${testCase.expectedOutput}, got ${output}`,
        };
      } catch (err) {
        return {
          testCase,
          passed: false,
          output: null,
          error: `Error executing code: ${err.message}`,
        };
      }
    });

    // Send the test results back to the client
    res.json({ testResults: results });

    // Send the test results back to the client
    res.json({ testResults: results });
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ error: 'Error executing code' });
  }
});

// Function to execute Python code
function executePythonCode(code, input) {
  try {
    // Prepare the Python script
    const script = `
import sys
input_data = ${input}
${code}
`;

    // Execute the Python script using child_process
    const result = spawnSync('python', ['-c', script], { encoding: 'utf-8' });

    // Check for errors
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (result.stderr) {
      throw new Error(result.stderr.trim());
    }

    // Return the output
    return result.stdout.trim();
  } catch (err) {
    throw new Error(`Python execution error: ${err.message}`);
  }
}

module.exports = router;