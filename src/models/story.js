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

storySchema.statics.updateCurrentStory = function(remove, next) {
  if (remove) {
    this.findOneAndUpdate(
      {isCurrent: true},
      {isCurrent: false},
      {upsert: false},
      next);
  } else {
    next();
  }
}

storySchema.statics.appendSentence = function(next) {
  this.getCurrentStory(function(err, story) {
    mongoose.model('Sentence').findTopSentence(story.id,
      story.sentenceCount, function(err, sentence) {
        story.sentences.push(sentence.id);
        story.sentenceCount++;
        story.save(function(err) {
          next(err, sentence.content);
        });
    });
  });
}

module.exports = mongoose.model('Story', storySchema, 'stories');
