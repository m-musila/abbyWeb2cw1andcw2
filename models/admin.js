const Datastore = require('nedb');
const bcrypt = require('bcrypt');

class Admin {
  constructor(dbFilePath) {
    if (dbFilePath) {
      this.db = new Datastore({ filename: dbFilePath, autoload: true });
    } else {
      this.db = new Datastore();
    }
  }

  // Add an admin
  addAdmin(name, email, password) {
    const hash = bcrypt.hashSync(password, 10);
    var admin = {
      name: name,
      email: email,
      password: hash,
    };
    this.db.insert(admin, function(err, newDoc) {
      if (err) {
        console.log('Cannot insert admin:', email);
      }
    });
  }

  // Find an admin by email
  findAdminByEmail(email, callback) {
    this.db.findOne({ email: email }, function(err, doc) {
      callback(err, doc);
    });
  }

  // Update an admin's information
  updateAdmin(email, update, callback) {
    this.db.update({ email: email }, { $set: update }, {}, function(err, numAffected) {
      callback(err, numAffected);
    });
  }

  // Delete an admin
  deleteAdmin(email, callback) {
    this.db.remove({ email: email }, {}, function(err, numRemoved) {
      callback(err, numRemoved);
    });
  }

  // ... additional methods as needed for admin management
}

module.exports = Admin;
