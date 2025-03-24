// DOM Elements
const app = document.getElementById('app');

// State Management
const state = {
  currentPage: 'index',
  isLoggedIn: false,
  username: null,
  challenges: [],
  leaderboard: [],
  challengeLeaderboards: {
    "1": [
      { username: "devwizard", timeToSolve: "00:30", points: 100 },
      { username: "pythonmaster", timeToSolve: "00:32", points: 98 },
      { username: "codegenius", timeToSolve: "00:35", points: 95 }
    ],
    "2": [
      { username: "logicmaster", timeToSolve: "00:45", points: 100 },
      { username: "pythonmaster", timeToSolve: "00:50", points: 95 },
      { username: "codegenius", timeToSolve: "00:55", points: 90 }
    ],
    "3": [
      { username: "codegenius", timeToSolve: "01:20", points: 100 },
      { username: "hackpro", timeToSolve: "01:10", points: 95 },
      { username: "datastructor", timeToSolve: "01:25", points: 90 }
    ],
    "4": [
      { username: "bugbuster", timeToSolve: "02:15", points: 100 },
      { username: "algorithmace", timeToSolve: "02:20", points: 95 },
      { username: "bytecoder", timeToSolve: "02:25", points: 90 }
    ],
    "5": [
      { username: "pythonmaster", timeToSolve: "00:45", points: 100 },
      { username: "syntaxslayer", timeToSolve: "01:35", points: 85 },
      { username: "devwizard", timeToSolve: "01:40", points: 80 }
    ],
  },
  userProgress: {
    totalChallengesCompleted: 15,
    easyCompleted: 6,
    mediumCompleted: 7,
    hardCompleted: 2,
    avgTimePerChallenge: "01:45",
    bestTime: "00:30",
    recentSubmissions: [
      { challenge: "Valid Parentheses", date: "2023-10-05", result: "Success", time: "01:15" },
      { challenge: "Two Sum", date: "2023-10-03", result: "Success", time: "00:55" },
      { challenge: "Longest Substring Without Repeating Characters", date: "2023-10-01", result: "Fail", time: "N/A" },
      { challenge: "Palindrome Check", date: "2023-09-28", result: "Success", time: "01:05" },
      { challenge: "FizzBuzz", date: "2023-09-25", result: "Success", time: "00:45" }
    ]
  },
  currentChallenge: null,
  currentFilter: 'all',
  timeLeft: 0,
  timerInterval: null,
  testResults: [],
  editor: null
};


async function getProblems() {
  const response = await fetch('http://localhost:3003/problems/get/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  state.challenges = data.data || [];

  const leader = await fetch('http://localhost:3003/leader/getbyproblem', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const lData = await leader.json();
  state.leaderboard = lData.data || [];
}

getProblems();

function navigateTo(page, params = {}) {
  // Update the current page in the state and localStorage
  state.currentPage = page;
  localStorage.setItem('currentPage', page);

  // Handle specific logic for the "challenge" page
  if (page === 'challenge' && params.id) {
    const challenge = state.challenges.find(c => c._id === params.id);
    if (challenge) {
      state.currentChallenge = challenge;
      state.timeLeft = challenge.timeLimit * 60; // Set the timer
      state.testResults = []; // Reset test results
    }
  }

  // Render the page
  App();

  // Initialize the editor and start the timer after rendering the "challenge" page
  if (page === 'challenge' && state.currentChallenge) {
    initializeEditor(); // Initialize the Monaco Editor
    startTimer(); // Start the timer
  }

  // Update the body class for styling purposes
  if (page !== 'index') {
    document.body.classList.remove('index-page');
    document.body.classList.add('other-page');
  } else {
    document.body.classList.add('index-page');
    document.body.classList.remove('other-page');
  }

  // Scroll to the top of the page
  window.scrollTo(0, 0);
}

// Check Authentication
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('codeMasterUser'));
  if (user) {
    state.isLoggedIn = true;
    state.username = user.username;
  } else {
    state.isLoggedIn = false;
    state.username = null;
  }
}

// Authentication
async function login(email, password) {
  if (email && password) {
    const body = {
      email,
      password
    }

    const response = await fetch('http://localhost:3003/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('codeMasterUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      state.isLoggedIn = true;
      state.username = data.user.username;
      showToast('Login successful!', 'success');
      navigateTo('home');
    } else {
      showToast('User NOT FOUND!', 'error');
    }
    
  } else {
    showToast('Please enter both username and password', 'error');
  }
}

async function signup(username, email, password, confirmPassword) {
  if (!username || !email || !password || !confirmPassword) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const body = {
    email,
    username,
    password
  }

  const response = await fetch('http://localhost:3003/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('codeMasterUser', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    state.isLoggedIn = true;
    state.username = data.user.username;
    showToast('Account created successfully!', 'success');
    navigateTo('home');
  } else {
    showToast(data.msg, 'error');
  }
}

function logout() {
  localStorage.removeItem('codeMasterUser');
  localStorage.removeItem('token');
  state.isLoggedIn = false;
  state.username = null;
  navigateTo('index');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Challenge Functions
function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timerInterval = setInterval(() => {
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      showToast("Time's up! Your solution was not submitted.", 'error');
    }
    state.timeLeft--;
    updateTimer();
  }, 1000);
}
let isSubmitting = false;
async function submitTimeToDatabase(challengeId, username, timeTaken) {
  if (!username) {
    showToast('You must be logged in to submit your time.', 'error');
    return;
  }
  try {
    const body = {
      challengeId,
      username,
      timeTaken: timeTaken - state.timeLeft, // Calculate time taken
    };

    const response = await fetch('http://localhost:3003/submit-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token if required
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data.success) {
      showToast('Time submitted successfully!', 'success');
        // Update recent submissions
        state.userProgress.recentSubmissions.unshift({
          challenge: state.currentChallenge.problem_header,
          date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
          result: 'Success',
          time: formatTime(timeTaken - state.timeLeft),
        });
        state.userProgress.recentSubmissions = state.userProgress.recentSubmissions.slice(0, 5);
      
    } else {
      showToast('Failed to submit time.', 'error');
    }
  } catch (error) {
    console.error('Error submitting time:', error);
    showToast('An error occurred while submitting time.', 'error');
  }
  finally {
    isSubmitting = false; // Reset the flag
  }
}

function updateTimer() {
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;
  
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  timerElement.textContent = formattedTime;
  
  if (state.timeLeft < 60) {
    timerElement.classList.add('time-warning');
  } else {
    timerElement.classList.remove('time-warning');
  }
}

async function runTests() {
  if (!state.currentChallenge || !state.editor) return;

  const code = state.editor.getValue(); // Get the code from Monaco Editor

  try {
    const response = await fetch('http://localhost:3003/run-tests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        testCases: state.currentChallenge.testCases,
      }),
    });

    const result = await response.json();
    state.testResults = result.testResults || [];

    const allPassed = state.testResults.every(test => test.passed);

    if (allPassed) {
      showToast('All tests passed!', 'success');
    } else {
      showToast('Some tests failed. Check the results.', 'error');
    }

    TestResults();
  } catch (error) {
    console.error('Error running tests:', error);
    showToast('An error occurred while running tests.', 'error');
  }
}

function submitSolution() {
  if (!state.testResults.every(result => result.passed)) {
    showToast('All tests must pass before submitting!', 'error');
    return;
  }
  
  if (state.timeLeft === 0) {
    showToast("Time's up! You cannot submit anymore.", 'error');
    return;
  }
  
  clearInterval(state.timerInterval);
  
  showToast('Solution submitted successfully!', 'success');
  
  // Simulate redirecting to leaderboard after submission
  setTimeout(() => {
    navigateTo('leaderboard');
  }, 2000);
}

// Page ers
function App() {
  checkAuth();
  
  // Clear previous content
  app.innerHTML = '';
  
  //  navbar if user is logged in and not on index, login, or signup page
  if (state.isLoggedIn && 
      !['index', 'login', 'signup'].includes(state.currentPage)) {
    app.appendChild(Navbar());
  }
  
  //  the current page
  switch (state.currentPage) {
    case 'index':
      app.appendChild(IndexPage());
      break;
    case 'login':
      app.appendChild(LoginPage());
      break;
    case 'signup':
      app.appendChild(SignupPage());
      break;
    case 'home':
      app.appendChild(HomePage());
      break;
    case 'challenges':
      getProblems();
      app.appendChild(ChallengesPage());
      break;
    case 'challenge':
      app.appendChild(ChallengePage());
      if (state.currentChallenge) {
        initializeEditor();
        startTimer();
      }
      break;
    case 'leaderboard':
      app.appendChild(LeaderboardPage());
      break;
    case 'challengeLeaderboard':
      app.appendChild(ChallengeLeaderboardPage());
      break;
    case 'profile':
      app.appendChild(ProfilePage());
      break;
    default:
      app.appendChild(NotFoundPage());
  }
  
  // Add toast container if it doesn't exist
  if (!document.querySelector('.toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

function Navbar() {
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  
  navbar.innerHTML = `
    <div class="navbar-brand" onclick="navigateTo('home')">
      <img src="logo.png" width="24" height="24" alt="Logo">
      CodeMaster
    </div>
    <div class="nav-menu">
      <a href="#" class="nav-link ${state.currentPage === 'home' ? 'active' : ''}" onclick="navigateTo('home'); return false;">Home</a>
      <a href="#" class="nav-link ${state.currentPage === 'challenges' ? 'active' : ''}" onclick="navigateTo('challenges'); return false;">Challenges</a>
      <a href="#" class="nav-link ${state.currentPage === 'leaderboard' ? 'active' : ''}" onclick="navigateTo('leaderboard'); return false;">Leaderboard</a>
      <a href="#" class="nav-link ${state.currentPage === 'profile' ? 'active' : ''}" onclick="navigateTo('profile'); return false;">Profile</a>
      <a href="#" class="nav-link" onclick="logout(); return false;">Logout</a>
    </div>
  `;
  
  return navbar;
}

function IndexPage() {
    console.log("IndexPage() called.");

    // Add a specific class to the body element for the index page
    document.body.classList.add('index-page');
    document.body.classList.remove('other-page'); // Remove other page class if any

    const indexPage = document.createElement('div');
    indexPage.className = 'page-center';

    indexPage.innerHTML = `
      <div class="index-container">
        <div class="index-content flex items-center">
          <img src="logo.png" alt="Logo" class="index-logo mr-4">
          <div>
            <h1>CodeMaster</h1>
            <p>Your Python coding journey begins here.</p>
          </div>
        </div>
        <div class="index-buttons">
          <button class="btn-login" onclick="navigateTo('login')">Login</button>
          <button class="btn-signup" onclick="navigateTo('signup')">Sign Up</button>
        </div>
      </div>
    `;

    return indexPage;
}

  

function LoginPage() {
  const loginPage = document.createElement('div');
  loginPage.className = 'page-center fade-in';
  
  loginPage.innerHTML = `
    
    <div class="auth-container">
      <h2 class="auth-title">Login</h2>
      <form id="loginForm" onsubmit="event.preventDefault(); handleLogin();">
        <div class="form-group">
          <label for="username" class="form-label">Email</label>
          <input type="text" id="username" class="form-input" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input type="password" id="password" class="form-input" placeholder="Enter your password" required>
        </div>
        <div class="auth-button">
          <button type="button" class="btn-outline" onclick="navigateTo('index')">Back</button>
          <button type="submit" class="btn-primary">Login</button>
        </div>
        <p class="mt-4 text-gray-500">
          Don't have an account? <a href="#" class="text-purple-400 hover:underline" onclick="navigateTo('signup'); return false;">Sign up</a>
        </p>
      </form>
    </div>
  `;
  
  return loginPage;
}

function SignupPage() {
  const signupPage = document.createElement('div');
  signupPage.className = 'page-center fade-in';
  
  signupPage.innerHTML = `
    
    <div class="auth-container">
      <h2 class="auth-title">Create an Account</h2>
      <form id="signupForm" onsubmit="event.preventDefault(); handleSignup();">
        <div class="form-group">
          <label for="signupUsername" class="form-label">Username</label>
          <input type="text" id="signupUsername" class="form-input" placeholder="Choose a username" required>
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" class="form-input" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label for="signupPassword" class="form-label">Password</label>
          <input type="password" id="signupPassword" class="form-input" placeholder="Create a password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input type="password" id="confirmPassword" class="form-input" placeholder="Confirm your password" required>
        </div>
        <div class="auth-button">
          <button type="button" class="btn-outline" onclick="navigateTo('index')">Back</button>
          <button type="submit" class="btn-primary">Sign Up</button>
        </div>
        <p class="mt-4 text-gray-500">
      Already have an account? <a href="#" class="text-purple-400 hover:underline" onclick="navigateTo('login'); return false;">Login</a>
    </p>
      </form>
    </div>
  `;
  
  return signupPage;
}

function HomePage() {
  const homePage = document.createElement('div');
  homePage.className = 'home-page fade-in';
  
  homePage.innerHTML = `
    <h1 class="home-title">Welcome, ${state.username || 'Coder'}</h1>
    <p class="home-subtitle">Start your coding journey with our Python challenges</p>
    <a href="#" class="btn1" onclick="navigateTo('challenges'); return false;">Start Coding</a>
    <div class="card-container">
      <div class="card">
        <h3 class="card-title">Timed Challenges</h3>
        <p class="card-text">Enhance your coding skills. Practice categorized challenges.</p>
        <a href="#" class="btn btn-primary" onclick="navigateTo('challenges'); return false;">View Challenges</a>
      </div>
      
      <div class="card">
        <h3 class="card-title">Leaderboard</h3>
        <p class="card-text">Compete with other programmers and improve your ranking.</p>
        <a href="#" class="btn btn-primary" onclick="navigateTo('leaderboard'); return false;">View Leaderboard</a>
      </div>
      
      <div class="card">
        <h3 class="card-title">Your Profile</h3>
        <p class="card-text">Track your progress and view your coding statistics.</p>
        <a href="#" class="btn btn-primary" onclick="navigateTo('profile'); return false;">View Profile</a>
      </div>
    </div>
  `;
  
  return homePage;
}

function ChallengePage() {
  if (!state.currentChallenge) {
    navigateTo('challenges');
    return document.createElement('div');
  }
  
  const challengePage = document.createElement('div');
  challengePage.className = 'container py-8 fade-in';
  
  const challenge = state.currentChallenge;
  const difficultyColorClass = getDifficultyColor(challenge.difficulty_level);
  
  challengePage.innerHTML = `
    <div class="flex flex-col md:flex-row justify-between items-start mb-6">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-2xl font-bold">${challenge.problem_header}</h1>
          <span class="difficulty ${difficultyColorClass}">${challenge.difficulty_level}</span>
        </div>
       
      </div>
      
      <div class="mt-4 md:mt-0 flex items-center gap-4">
        <div class="flex items-center">
          <img src="logo.png" width="20" height="20" alt="Timer" class="mr-2">
          <span id="timer" class="text-xl font-mono">${formatTime(challenge.timeLimit * 60)}</span>
        </div>
        
        <button class="btn btn-outline" onclick="navigateTo('challenges')">
          Back to Challenges
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
          <div class="py-2 px-4 bg-gray-700 rounded-t-md">
            <h3 class="text-sm font-medium">Python Editor</h3>
          </div>
          <div class="editor-container" id="editor"></div>
          
        
        <div class="flex gap-4 mt-4">
          <button class="btn btn-secondary flex-1" id="runButton" onclick="runTests()">
            Run Tests
          </button>
          <button class="btn btn-primary flex-1" id="submitButton" onclick="submitSolution()" disabled>
            Submit
          </button>
        </div>
      </div>
      
      <div>
        <div class="tabs">
          <div class="tab active" onclick="showTab('instructions')">Instructions</div>
          <div class="tab" onclick="showTab('tests')">Test Results</div>
        </div>
        
        <div id="instructionsTab" class="card-i">
          <div class="p-4">
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">Problem Description</h3>
              <p class="text-gray-400">${challenge.problem_description}</p>
            </div>
            
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">Time Limit</h3>
              <p class="text-gray-400">${challenge.timeLimit} minutes</p>
            </div>
            
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">Test Cases</h3>
              <div class="space-y-4">
                ${challenge.test_cases.map((testCase, index) => `
                  <div class="bg-gray-700 p-4 rounded-md">
                    <div class="mb-2">
                      <span class="text-gray-400">Input: </span>
                      <span class="font-mono text-white">${testCase.input}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Expected Output: </span>
                      <span class="font-mono text-white">${testCase.expectedOutput}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-medium mb-2">Notes</h3>
              <ul class="list-disc list-inside text-gray-400 space-y-2">
                <li>All test cases must pass to submit your solution</li>
                <li>You must submit before the time limit expires</li>
                <li>The timer starts as soon as you open the challenge</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div id="testsTab" class="card-i" style="display: none;">
          <div class="p-4" id="testResults">
            <div class="flex flex-col items-center justify-center h-64 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 mb-4">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p class="text-gray-400 mb-2">No tests have been run yet</p>
              <p class="text-gray-500 text-sm max-w-sm">
                Click "Run Tests" to see the results of your solution against the test cases
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return challengePage;
}


function ChallengesPage() {
  const challengesPage = document.createElement('div');
  challengesPage.className = 'container py-8 fade-in';
  
  challengesPage.innerHTML = `
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold mb-2">Python Challenges</h1>
      <p class="text-gray-400">Select a challenge to test your skills</p>
    </div>

    <div class="max-w-4xl mx-auto">
      <div class="bt-container">
        <div class="bt ${state.currentFilter === 'all' ? 'active' : ''}" onclick="filterChallenges('all')">All</div>
        <div class="bt ${state.currentFilter === 'low' ? 'active' : ''}" onclick="filterChallenges('low')">Low</div>
        <div class="bt ${state.currentFilter === 'medium' ? 'active' : ''}" onclick="filterChallenges('medium')">Medium</div>
        <div class="bt ${state.currentFilter === 'hard' ? 'active' : ''}" onclick="filterChallenges('hard')">Hard</div>
      </div>

      <div class="card-container" id="challengesContainer">
        <!-- Challenges will be ed here by filterChallenges() -->
      </div>
    </div>
  `;
  
  const container = challengesPage.querySelector('#challengesContainer');
  
  // Filter challenges based on current filter
  const filteredChallenges = state.currentFilter === 'all' 
    ? state.challenges 
    : state.challenges.filter(challenge => challenge.difficulty_level === state.currentFilter);
  
  //  challenges
  filteredChallenges.forEach(challenge => {
    const card = document.createElement('div');
    card.className = 'card-c';
    
    const difficultyColorClass = getDifficultyColor(challenge.difficulty_level);
    
    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="card-title">${challenge.problem_header}</h3>
        <span class="difficulty ${difficultyColorClass}">${challenge.difficulty_level}</span>
      </div>
      
      <div class="flex justify-between items-center mt-4">
        <div class="flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${challenge.timeLimit} min</span>
        </div>
        <button class="btn btn-primary" onclick="navigateTo('challenge', {id: '${challenge._id}'})">Solve</button>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  return challengesPage;
}

function ProfilePage() {
  fetchUserProfile();
  const profilePage = document.createElement('div');
  profilePage.className = 'container py-8 fade-in';
  
  const progress = state.userProgress;
  
  profilePage.innerHTML = `
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold mb-2">Your Profile</h1>
      <p class="text-gray-400">${state.username || 'Anonymous'}</p>
    </div>
    
    <div class="max-w-4xl mx-auto">
      <div class="stats-container mb-8">
        <div class="stat-card">
          <div class="stat-value">${progress.totalChallengesCompleted}</div>
          <div class="stat-label">Challenges Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${progress.easyCompleted}</div>
          <div class="stat-label">Easy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${progress.mediumCompleted}</div>
          <div class="stat-label">Medium</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${progress.hardCompleted}</div>
          <div class="stat-label">Hard</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${progress.avgTimePerChallenge}</div>
          <div class="stat-label">Average Time</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${progress.bestTime}</div>
          <div class="stat-label">Best Time</div>
        </div>
      </div>
      
      <h2 class="text-xl font-bold mb-4">Recent Submissions</h2>
      <div class="card-l">
        <div class="overflow-x-auto">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>Challenge</th>
                <th>Date</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              ${progress.recentSubmissions.map(submission => `
                <tr>
                  <td>${submission.challenge}</td>
                  <td>${submission.date}</td>
                  <td class="${submission.result === 'Success' ? 'text-green-500' : 'text-red-500'}">${submission.result}</td>
                  <td>${submission.time}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  return profilePage;
}

function NotFoundPage() {
  const notFoundPage = document.createElement('div');
  notFoundPage.className = 'page-center';
  
  notFoundPage.innerHTML = `
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">404</h1>
      <p class="text-xl text-gray-400 mb-8">Page not found</p>
      <button class="btn btn-primary" onclick="navigateTo('home')">Return Home</button>
    </div>
  `;
  
  return notFoundPage;
}
async function fetchFeatureFlags() {
  try {
    const response = await axios.get('http://localhost:3003/feature-flags');
    console.log(response.data); // Log the feature flags to ensure they are fetched correctly
    state.featureFlags = response.data || {}; // Store the feature flags in the state
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    state.featureFlags = {}; // Default to an empty object if the request fails
  }
}
function TestResults() {
  const testResultsContainer = document.getElementById('testResults');
  if (!testResultsContainer || !state.testResults.length) return;
  
  testResultsContainer.innerHTML = '';
  
  const results = document.createElement('div');
  results.className = 'space-y-4';
  
  state.testResults.forEach((result, index) => {
    const resultElement = document.createElement('div');
    resultElement.className = result.passed ? 'test-result test-passed' : 'test-result test-failed';
    
    resultElement.innerHTML = `
      <div class="flex items-start">
        ${result.passed ? `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 mt-0.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        ` : `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 mt-0.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        `}
        <div>
          <h4 class="font-medium mb-2">
            Test Case ${index + 1} ${result.passed ? 'Passed' : 'Failed'}
          </h4>
          <div class="mb-1">
            <span class="text-gray-400">Input: </span>
            <span class="font-mono">${result.testCase.input}</span>
          </div>
          <div class="mb-1">
            <span class="text-gray-400">Expected Output: </span>
            <span class="font-mono">${result.testCase.expectedOutput}</span>
          </div>
          <div>
            <span class="text-gray-400">Your Output: </span>
            <span class="font-mono">${result.output}</span>
          </div>
          ${result.error ? `
            <div class="mt-2 p-2 bg-red-900/50 rounded font-mono text-sm text-red-300">
              ${result.error}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    results.appendChild(resultElement);
  });
  
  testResultsContainer.appendChild(results);
  
  // Enable the submit button if all tests pass
  const submitButton = document.getElementById('submitButton');
  if (submitButton) {
    const allPassed = state.testResults.every(result => result.passed);
    submitButton.disabled = !allPassed;
  }
}

// Helper Functions
function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'low':
      return 'difficulty-easy';
    case 'medium':
      return 'difficulty-medium';
    case 'hard':
      return 'difficulty-hard';
    default:
      return '';
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getChallengeIdByName(id) {
  const challenge = state.challenges.find(c => c._id === id);
  console.log(challenge);
  return challenge ? challenge._id : '1';
}

function showChallengeLeaderboard(challengeId) {
  const challenge = state.challenges.find(c => c._id === challengeId);
  if (challenge) {
    state.currentChallenge = challenge;
    navigateTo('challengeLeaderboard');
  }
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('active');
  }
}

function filterChallenges(filter) {
  state.currentFilter = filter;
  
  // Update active states of filter buttons
  const buttons = document.querySelectorAll('.bt');
  buttons.forEach(button => {
    button.classList.remove('active');
    if (button.textContent.toLowerCase() === filter || 
        (filter === 'all' && button.textContent === 'All')) {
      button.classList.add('active');
    }
  });
  
  // Update the challenges display
  const container = document.getElementById('challengesContainer');
  if (!container) return;
  
  const filteredChallenges = state.currentFilter === 'all' 
    ? state.challenges 
    : state.challenges.filter(challenge => challenge.difficulty_level === state.currentFilter);
  
  container.innerHTML = filteredChallenges.map(challenge => `
    <div class="card-c" onclick="navigateTo('challenge', { id: '${challenge.id}' })">
      <div class="flex justify-between items-start mb-2">
        <h3 class="card-title">${challenge.problem_header}</h3>
        <div class="difficulty-badge difficulty-${challenge.difficulty_level.toLowerCase()}">
          ${challenge.difficulty_level.charAt(0).toUpperCase() + challenge.difficulty_level.slice(1)}
        </div>
      </div>
      <div class="flex justify-between items-center mt-4">
        <div class="flex items-center text-gray-400">
          <span>${challenge.timeLimit} min</span>
        </div>
        <button class="btn btn-primary">Solve</button>
      </div>
    </div>
  `).join('');
}

function showTab(tabName) {
  const instructionsTab = document.getElementById('instructionsTab');
  const testsTab = document.getElementById('testsTab');
  const tabs = document.querySelectorAll('.tab');
  
  if (instructionsTab && testsTab) {
    if (tabName === 'instructions') {
      instructionsTab.style.display = 'block';
      testsTab.style.display = 'none';
    } else {
      instructionsTab.style.display = 'none';
      testsTab.style.display = 'block';
    }
    
    tabs.forEach((tab, index) => {
      if ((tabName === 'instructions' && index === 0) || (tabName === 'tests' && index === 1)) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }
}

function initializeEditor() {
  const editorContainer = document.getElementById('editor');
  if (!editorContainer) {
    console.error('Editor container not found!');
    return;
  }

  // Dispose of the existing editor instance if it exists
  if (state.editor) {
    state.editor.dispose();
  }

  // Clear any existing content in the editor container
  editorContainer.innerHTML = '';

  // Load Monaco Editor
  require.config({
    paths: { vs: 'https://unpkg.com/monaco-editor/min/vs' },
    waitSeconds: 30, // Increase timeout to 30 seconds
  });

  require(['vs/editor/editor.main'], function () {
    state.editor = monaco.editor.create(editorContainer, {
      value: '# Start coding here...\n)',
      language: 'python',
      theme: 'vs-dark',
      automaticLayout: true,
    });

    console.log('Editor initialized:', state.editor);
  });
}
function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  login(username, password);
}

function handleSignup() {
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  signup(username, email, password, confirmPassword);
}

// Add Toast CSS
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
  }
  
  .toast {
    min-width: 250px;
    margin-bottom: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    background-color: #374151;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: opacity 0.3s;
  }
  
  .toast-success {
    background-color: #059669;
  }
  
  .toast-error {
    background-color: #dc2626;
  }
  
  .time-warning {
    color: #ef4444;
  }
`;
document.head.appendChild(toastStyles);

// Initialize the app

  
  // Start the app
  window.onload = async function () {
    console.log("🚀 Window loaded. Running App...");
    
    // Retrieve the current page from localStorage
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
      state.currentPage = savedPage;
    }
  
    // Start the app
    App();
  };