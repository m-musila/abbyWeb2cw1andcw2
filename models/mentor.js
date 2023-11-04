const Datastore = require('nedb');
class Mentor {
    constructor(dbFilePath) {
      if (dbFilePath) {
        this.db = new Datastore({ filename: dbFilePath, autoload: true });
      } else {
        this.db = new Datastore();
      }
    }
  
    addMentor(name, email, expertise) {
      let mentor = {
        name: name,
        email: email,
        expertise: expertise,
      };
      this.db.insert(mentor, function(err, newDoc) {
        if (err) {
          console.log("Cannot insert mentor:", name);
        }
      });
    }
  
    findMentorByEmail(email, callback) {
      this.db.findOne({ email: email }, function(err, doc) {
        callback(err, doc);
      });
    }
  
    updateMentor(email, update, callback) {
      this.db.update({ email: email }, { $set: update }, {}, function(err, numAffected) {
        callback(err, numAffected);
      });
    }
  
    deleteMentor(email, callback) {
      this.db.remove({ email: email }, {}, function(err, numRemoved) {
        callback(err, numRemoved);
      });
    }
  
    // Additional methods to interact with mentor data as required...
  }
  
  module.exports = Mentor;
  