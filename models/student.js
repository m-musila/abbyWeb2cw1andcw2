const Datastore = require('nedb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class Student {
  constructor(dbFilePath) {
    if (dbFilePath) {
      // Persistent datastore with automatic loading
      this.db = new Datastore({ filename: dbFilePath, autoload: true });
    } else {
      // In-memory datastore
      this.db = new Datastore();
    }
  }

  // Method to initialize our dataset
  init() {
    const hash = bcrypt.hashSync('password', 10);
    this.db.insert({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: hash,
      opportunities: [],
      goals: []  // Initialize the goals array
    }, function (err, doc) {
      if (err) {
        console.log('Can\'t insert user: ', name);
      } else {
        console.log('Added user:', doc);
      }
    });
  }

  // Add a student with an initial goal structure as objects
  async addStudent(name, email, password) {
    const hash = await bcrypt.hash(password, 10);
    const entry = {
      name: name,
      email: email,
      password: hash,
      opportunities: [],
      goals: []  // Each goal will now be an object
    };
    return new Promise((resolve, reject) => {
      this.db.insert(entry, function (err, newDoc) {
        if (err) {
          reject('Cannot insert student: ' + email);
        } else {
          resolve(newDoc);
        }
      });
    });
  }

  // Find a student by email
  async findStudentByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ email: email }, function (err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  // Update a student's information
  async updateStudent(email, update) {
    return new Promise((resolve, reject) => {
      this.db.update({ email: email }, { $set: update }, {}, function (err, numAffected) {
        if (err) {
          reject(err);
        } else {
          resolve(numAffected);
        }
      });
    });
  }

  // Delete a student
  async deleteStudent(email) {
    return new Promise((resolve, reject) => {
      this.db.remove({ email: email }, {}, function (err, numRemoved) {
        if (err) {
          reject(err);
        } else {
          resolve(numRemoved);
        }
      });
    });
  }

  // Add an opportunity to a student's plan
  async addOpportunityToStudent(email, opportunityId) {
    return new Promise((resolve, reject) => {
      this.db.update({ email: email }, { $push: { opportunities: opportunityId } }, {}, function (err, numAffected) {
        if (err) {
          reject(err);
        } else {
          resolve(numAffected);
        }
      });
    });
  }

  // Remove an opportunity from a student's plan
  async removeOpportunityFromStudent(email, opportunityId) {
    return new Promise((resolve, reject) => {
      this.db.update({ email: email }, { $pull: { opportunities: opportunityId } }, {}, function (err, numAffected) {
        if (err) {
          reject(err);
        } else {
          resolve(numAffected);
        }
      });
    });
  }

  // Get all students
  async getAllStudents() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

  // Compare password
  async comparePassword(candidatePassword, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) {
          reject(err);
        } else {
          resolve(isMatch);
        }
      });
    });
  }


  // Add a goal to a student's plan
  async addGoalToStudent(email, goalDescription) {
    const goal = {
      id: uuidv4(), // Assign a unique identifier to the goal
      description: goalDescription,
      completed: false
    };
    return new Promise((resolve, reject) => {
      this.db.update(
        { email: email },
        { $push: { goals: goal } },
        { multi: false },
        function (err, numAffected) {
          if (err) {
            reject('Cannot add goal to student: ' + email);
          } else {
            resolve(numAffected);
          }
        }
      );
    });
  }



  // Update a goal for a student
  async updateGoalOfStudent(email, goalId, newGoal) {
    return new Promise((resolve, reject) => {
      // Assuming goalId is the index of the goal in the goals array
      this.db.update({ email: email }, { $set: { ['goals.' + goalId]: newGoal } }, {}, function (err, numAffected) {
        if (err) {
          reject('Cannot update goal for student: ' + email);
        } else {
          resolve(numAffected);
        }
      });
    });
  }

  async removeGoalFromStudent(email, goalId) {
    return new Promise((resolve, reject) => {
      this.db.update(
        { email: email },
        { $pull: { goals: { id: goalId } } }, // Match the goal by its unique `id` to remove it
        {},
        function (err, numAffected) {
          if (err) {
            reject('Error removing goal for student: ' + email);
          } else if (numAffected === 0) {
            reject('No goal found with the provided ID');
          } else {
            resolve(numAffected);
          }
        }
      );
    });
  }
  


  async updateGoalCompletion(email, goalId, completed) {
    return new Promise((resolve, reject) => {
      this.findStudentByEmail(email).then(student => {
        const goal = student.goals.find(g => g.id === goalId);
        if (!goal) {
          reject(new Error('Goal not found'));
        } else {
          goal.completed = completed; // Update the completion status of the goal
          this.db.update(
            { email: email },
            { $set: { goals: student.goals } }, // Update the entire goals array
            {},
            function (err, numAffected) {
              if (err) {
                reject(new Error('Cannot update goal completion for student: ' + email));
              } else {
                resolve(numAffected);
              }
            }
          );
        }
      }).catch(err => {
        reject(new Error('Cannot find student: ' + email));
      });
    });
  }
  async toggleGoalCompletion(email, goalId) {
    return new Promise((resolve, reject) => {
      this.findStudentByEmail(email).then(student => {
        const goalIndex = student.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) {
          reject(new Error('Goal does not exist'));
        } else {
          const goal = student.goals[goalIndex];
          goal.completed = !goal.completed; // Toggle the completion status
          this.db.update(
            { email: email },
            { $set: { goals: student.goals } }, // Update the entire goals array
            {},
            function (err, numAffected) {
              if (err) {
                reject(new Error('Cannot toggle goal completion for student: ' + email));
              } else {
                resolve({ numAffected: numAffected, completed: goal.completed });
              }
            }
          );
        }
      }).catch(err => {
        reject(new Error('Cannot find student: ' + email));
      });
    });
  }
    




}



module.exports = Student;
