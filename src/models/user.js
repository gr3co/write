var mongoose = require('mongoose'),
Schema = mongoose.Schema;

// including these here for simplicity
require('./sentence');
require('./story');


var userSchema = new Schema({
  created: {type: Date, default: Date.now},
  facebookId: String,
  username: String,
  name: {
    last: String,
    first: String
  },
  email: String,
  score: {type: Number, default: 0},
  active: {type: Boolean, default: false},
  // 0: regular, 1: mod, 2: admin
  accessLevel: {type: Number, default: 0}
},
{
  versionKey: false
});

module.exports = mongoose.model('User', userSchema, 'users');
