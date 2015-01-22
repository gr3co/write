var mongoose = require('mongoose'),
Schema = mongoose.Schema,
idnum = Schema.ObjectId;

var sentenceSchema = new Schema({
  submitted: {type: Date, default: Date.now},
  upvotes: {type: [{
  	timestamp: {type: Date, default: Date.now},
  	voter: {type: idnum, ref: 'User'}
  }], default: []},
  downvotes: {type: [{
  	timestamp: {type: Date, default: Date.now},
  	voter: {type: idnum, ref: 'User'}
  }], default: []},
  score: {type: Number, default: 0},
  submitter: {type: idnum, ref: 'User'},
  story: {type: idnum, ref: 'Story'},
  content: {type: String, default: ''}
},
{
  versionKey: false
});

sentenceSchema.statics.getSentencesForStory = function(story, next) {
	this.find({story: story}).exec(next);
};

sentenceSchema.statics.upvote = function(id, user, next) {
  this.update({'_id' : id}, {
    $inc : {score : 1},
    $addToSet: {upvotes : {timestamp: Date.now(), voter: user}}
  }).exec(next);
}

sentenceSchema.statics.downvote = function(id, user, next) {
  this.update({'_id' : id}, {
    $inc : {score : -1},
    $addToSet: {downvotes : {timestamp: Date.now(), voter: user}}
  }).exec(next);
}

module.exports = mongoose.model('Sentence', sentenceSchema, 'sentences');
