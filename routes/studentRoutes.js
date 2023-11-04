const express = require('express');
const studentController = require('../controllers/studentController.js');
const { verifyStudent } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Registration routes
router.get('/student/register', studentController.register_page);
router.post('/student/register', studentController.process_registration);

// Login routes
router.get('/student/login', studentController.login_page);
router.post('/student/login', studentController.process_login);

// Dashboard route
router.get('/student/dashboard', verifyStudent, studentController.dashboard_page);

// Viewing opportunities
router.get('/student/opportunities', verifyStudent, studentController.view_opportunities);

// Registering interest in an opportunity
router.post('/student/opportunities/:id/register', verifyStudent, studentController.register_interest);

// Cancelling interest in an opportunity
router.post('/student/opportunities/:id/cancel', verifyStudent, studentController.cancel_interest);

// Viewing registered opportunities
router.get('/student/registeredOpportunities', verifyStudent, studentController.list_registered_opportunities);

// Adding a new goal
router.get('/students/goals/add', verifyStudent, studentController.add_goal_page);
router.post('/students/goals/add', verifyStudent, studentController.addGoal);

// Updating an existing goal
router.post('/students/goals/edit/:id', verifyStudent, studentController.updateGoal);

// Removing an existing goal - now using POST method
router.post('/students/goals/remove/:id', verifyStudent, studentController.removeGoal);

// Toggling goal completion - only POST method needed
router.post('/students/goals/toggleCompletion/:id', verifyStudent, studentController.toggleGoalCompletion);




module.exports = router;

