var mongoose = require('mongoose'),
Schema = mongoose.Schema,
idnum = Schema.ObjectId;

var storySchema = new Schema({
  created: {type: Date, default: Date.now},
  isCurrent: {type: Boolean, default: false},
  sentenceCount: {type: Number, default: 0},
  sentences: {
  	type: [{type: idnum, ref: 'Sentence'}],
  	default: []
  },
  title: {type: String, default: 'Untitled'},
  url: {type: String, default: ''},
},
{
  versionKey: false
});

storySchema.statics.getCurrentStory = function(next) {
	this.findOne({isCurrent: true})
		.populate('sentences')
		.exec(next);
}

module.exports = mongoose.model('Story', storySchema, 'stories');
