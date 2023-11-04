const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const StudentModel = require('../models/student.js');
const MentorModel = require('../models/mentor.js');
const OpportunityModel = require('../models/opportunity.js');
const AdminModel = require('../models/admin.js');

// Instantiate models (assuming you have separate ones for Admin)
const adminModel = new AdminModel('database/admin.db');
const studentModel = new StudentModel('database/students.db');
const mentorModel = new MentorModel('database/mentor.db');
const opportunityModel = new OpportunityModel('database/opportunity.db');

exports.login_page = (req, res) => {
  // Render the admin login page view
  res.render('admins/login', { title: 'Admin Login' });
};

exports.process_login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Use the AdminModel to find the admin by email
    adminModel.findAdminByEmail(email, (err, admin) => {
      // If an error occurs, or admin not found, return an error
      if (err || !admin) {
        res.status(401).render('admins/login', { message: 'Invalid email or password' });
        return;
      }

      // Use bcrypt to compare the submitted password with the stored hash
      bcrypt.compare(password, admin.password, (err, result) => {
        if (err || !result) {
          res.status(401).render('admins/login', { message: 'Invalid email or password' });
          return;
        }

        // If password is correct, create a JWT token
        const token = jwt.sign(
          { id: admin._id, email: admin.email },
          process.env.ADMIN_JWT_SECRET,
          { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Store the token in a cookie and redirect to the dashboard
        res.cookie('admin_jwt', token, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/admin/dashboard');
      });
    });

  } catch (error) {
    res.status(500).render('admins/error', { message: 'An error occurred during login' });
  }
};

exports.dashboard_page = (req, res) => {
  // Render the admin dashboard page view after successful login
  res.render('admins/dashboard', { title: 'Admin Dashboard' });
};


// List all students
exports.list_students = async (req, res) => {
  try {
    const students = await studentModel.getAllStudents();
    res.render('admins/manage_students', { title: 'Manage Students', students });
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error retrieving student records' });
  }
};

// Add a new student
exports.new_student_page = (req, res) => {
  res.render('admins/new_student', { title: 'Add New Student' });
};

exports.create_student = async (req, res) => {
  try {
    await studentModel.addStudent(req.body);
    res.redirect('/admins/students');
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error adding student' });
  }
};

// Edit a student record
exports.edit_student_page = async (req, res) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    res.render('admins/edit_student', { title: 'Edit Student', student });
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error retrieving student information' });
  }
};

exports.update_student = async (req, res) => {
  try {
    await studentModel.updateStudent(req.params.id, req.body);
    res.redirect('/admins/students');
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error updating student' });
  }
};

// Delete a student record
exports.delete_student = async (req, res) => {
  try {
    await studentModel.deleteStudent(req.params.id);
    res.redirect('/admins/students');
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error deleting student' });
  }
};

// List all opportunities
exports.list_opportunities = async (req, res) => {
  try {
    const opportunities = await opportunityModel.getAllOpportunities();
    res.render('admins/manage_opportunities', { title: 'Manage Opportunities', opportunities });
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error retrieving opportunities' });
  }
};

// Assuming opportunityModel is already created and has the necessary methods

// Display the form for adding a new opportunity
exports.new_opportunity_page = (req, res) => {
  res.render('admins/new_opportunity', { title: 'Add New Opportunity' });
};

// Process the form data and add a new opportunity
exports.create_opportunity = async (req, res) => {
  try {
    await opportunityModel.addOpportunity(req.body);
    res.redirect('/admins/opportunities');
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error creating opportunity' });
  }
};

// Display the form for editing an existing opportunity
exports.edit_opportunity_page = async (req, res) => {
  try {
    const opportunity = await opportunityModel.getOpportunityById(req.params.id);
    res.render('admins/edit_opportunity', { title: 'Edit Opportunity', opportunity });
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error retrieving opportunity' });
  }
};

// Process the form data and update an existing opportunity
exports.update_opportunity = async (req, res) => {
  try {
    await opportunityModel.updateOpportunity(req.params.id, req.body);
    res.redirect('/admins/opportunities');
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error updating opportunity' });
  }
};

// Process the request to delete an opportunity
exports.delete_opportunity = async (req, res) => {
  try {
    await opportunityModel.deleteOpportunity(req.params.id);
    res.redirect('/admins/opportunities');
  } catch (error) {
    res.status(500).render('admins/error', { message: 'Error deleting opportunity' });
  }
};
exports.list_students = (req, res) => {
  studentModel.getAllStudents((err, students) => {
    if (err) {
      res.status(500).render('admins/error', { message: 'Error retrieving student records' });
      return;
    }
    res.render('admins/manage_students', { title: 'Manage Students', students });
  });
};

exports.list_opportunities = (req, res) => {
  opportunityModel.getAllOpportunities((err, opportunities) => {
    if (err) {
      res.status(500).render('admins/error', { message: 'Error retrieving opportunities' });
      return;
    }
    res.render('admins/manage_opportunities', { title: 'Manage Opportunities', opportunities });
  });
};
