const jwt = require('jsonwebtoken');
require('dotenv').config();

const StudentModel = require('../models/student.js');
const studentModel = new StudentModel('database/student.db');

const OpportunityModel = require('../models/opportunity.js');
// Create an instance of the Opportunity model
const opportunityModel = new OpportunityModel('../database/opportunity.db');


exports.login_page = (req, res) => {
  // Render the login page view
  res.render('students/login', { title: 'Student Login' });
};

exports.dashboard_page = async (req, res) => {
  try {
    // Ensure req.student is populated by your auth middleware
    const email = req.student.email;
    const studentData = await studentModel.findStudentByEmail(email);

    // Transform goals into the expected format for the template
    const goalsForTemplate = studentData.goals.map(goal => {
      return {
        goalDescription: goal.description, // Make sure to use goal.description
        id: goal.id, // Use the unique identifier assigned to each goal
        completed: goal.completed // Pass the completion status as well
      };
    });

    // Render the student dashboard page view after successful login
    res.render('students/dashboard', {
      title: 'Dashboard',
      studentEmail: studentData.email, // Pass the email to use as the identifier
      goals: goalsForTemplate, // Pass the transformed goals
      // Pass any other required data for opportunities or other dashboard elements
    });
  } catch (error) {
    console.error('Dashboard loading error:', error);
    res.status(500).send('Error loading dashboard');
  }
};




// ... Other methods like handling login submission, registration, viewing and managing opportunities ...
exports.register_page = (req, res) => {
  res.render('students/registration', { title: 'Student Registration' });
};

exports.process_registration = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const student = await studentModel.addStudent(name, email, password);
    // If successful, redirect to the login page
    res.redirect('/student/login');
  } catch (error) {
    // If an error occurs, send a response with the error message
    res.status(500).send(error);
  }
};

// Assume studentModel.findStudentByEmail and a comparePassword method exists
exports.process_login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await studentModel.findStudentByEmail(email);
    if (!student) {
      return res.status(401).send('Authentication failed');
    }
    const isMatch = await studentModel.comparePassword(password, student.password);
    if (isMatch) {
      // Create token, set cookie, and redirect to dashboard
      const accessToken = jwt.sign({ email: student.email }, process.env.ACCESS_TOKEN_SECRET);
      res.cookie('jwt', accessToken).redirect('/student/dashboard');
    } else {
      res.status(401).send('Password incorrect');
    }
  } catch (error) {
    res.status(500).send('An error occurred during login');
  }
};

exports.view_opportunities = async (req, res) => {
  try {
    const opportunities = await opportunityModel.getAllOpportunities();
    res.render('students/opportunities', { title: 'Available Opportunities', opportunities });
  } catch (err) {
    res.status(500).send('Error fetching opportunities');
  }
};

exports.register_interest = async (req, res) => {
  const studentId = req.student.id; // Assuming the student's ID is stored in req.student
  const opportunityId = req.params.id; // The ID of the opportunity

  try {
    await opportunityModel.registerInterest(studentId, opportunityId);
    res.redirect('/students/opportunities');
  } catch (err) {
    res.status(500).send('Error registering interest');
  }
};

exports.list_registered_opportunities = async (req, res) => {
  const studentId = req.student.id;

  try {
    const opportunities = await opportunityModel.getRegisteredOpportunities(studentId);
    res.render('students/registered_opportunities', { title: 'Your Registered Opportunities', opportunities });
  } catch (err) {
    res.status(500).send('Error fetching registered opportunities');
  }
};

exports.cancel_interest = async (req, res) => {
  const studentId = req.student.id;
  const opportunityId = req.params.id;

  try {
    await opportunityModel.cancelInterest(studentId, opportunityId);
    res.redirect('/students/registered_opportunities');
  } catch (err) {
    res.status(500).send('Error canceling interest');
  }
};

// Function to serve the add goal form
exports.add_goal_page = (req, res) => {
  res.render('students/goals/addgoal', { title: 'Add Goal' }); // Render the addGoal.mustache file
};
// Function to add a goal
exports.addGoal = async (req, res) => {
  try {
    const email = req.student.email; // Access the email from the verified student object
    const goal = req.body.goal; // Assuming goal data is sent in request body
    await studentModel.addGoalToStudent(email, goal);
    res.redirect('/student/dashboard'); // Redirect to the dashboard after adding the goal
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Function to update a goal
exports.updateGoal = async (req, res) => {
  try {
    const email = req.student.email; // Replace with actual session retrieval
    const goalId = req.params.id; // The ID of the goal to update
    const newGoal = req.body.goal; // The new goal data from the request
    await studentModel.updateGoalOfStudent(email, goalId, newGoal);
    res.redirect('/student/dashboard'); // Redirect to the dashboard after updating the goal
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Function to remove a goal
exports.removeGoal = async (req, res) => {
  try {
    const email = req.student.email; // Replace with actual session retrieval
    const goalId = req.params.id; // The unique ID of the goal to remove
    await studentModel.removeGoalFromStudent(email, goalId);
    res.redirect('/student/dashboard'); // Redirect to the dashboard after removing the goal
  } catch (error) {
    res.status(500).send(error.message);
  }
};


exports.completeGoal = async (req, res) => {
  try {
    const email = req.student.email; // Replace with actual session retrieval
    const goalId = req.params.id; // The ID of the goal to complete
    await studentModel.updateGoalCompletion(email, goalId, true);
    res.redirect('/student/dashboard'); // Redirect to the dashboard after marking the goal as complete
  } catch (error) {
    res.status(500).send(error.message);
  }
};


exports.toggleGoalCompletion = async (req, res) => {
  const email = req.student.email; // Ensure you have the student's email from the session
  const goalId = req.params.id; // The ID of the goal to toggle

  try {
    // Toggle the completion status of the goal and retrieve the updated goal
    const updatedGoal = await studentModel.toggleGoalCompletion(email, goalId);

    if (!updatedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Respond with the new completion status
    res.json({ completed: updatedGoal.completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






