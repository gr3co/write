var express = require('express'),
passportSocketIo = require("passport.socketio"),
Sentence = require('mongoose').model('Sentence'),
Story = require('mongoose').model('Story'),
_ = require('underscore');

module.exports = function(server, cstore) {

  //set up socket.io server
  var io = require('socket.io').listen(server);

  var acceptConnection = function(data, accept) {
    accept(null, true);
  };
  var rejectConnection = function(data, message, error, accept) {
    if (error) {
      console.error("Rejected connection: " + error);
    }
    accept(null, false);
  };
  var containsVoter = function(list, voter) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].voter == voter) {
        return true;
      }
    }
    return false;
  }

  //force authorization before handshaking
  io.set('authorization', passportSocketIo.authorize({
    cookieParser: express.cookieParser,
    secret: config.cookie.secret,
    store: cstore,
    success: acceptConnection,
    fail: rejectConnection
  }));

  var update_time = new Date(new Date().getTime() + config.update_timer);

  // automatically update the story
  setInterval(function() {
    Story.appendSentence(function(err, sentence) {
      update_time = new Date(new Date().getTime() + config.update_timer);
      io.sockets.emit('story_update', {
        sentence: sentence,
        next_update: update_time - new Date()
      });
    });
  }, config.update_timer);


  io.sockets.on('connection', function(socket) {

    // for auth related purposes
    var user = socket.conn.request.user;

    socket.on('request_sentences', function(val) {
      Story.getCurrentStory(function(err, story) {
        if (err) {
          console.log(err);
        } else {
          if (story == null) {
            return;
          }
          Sentence.find({story: story.id,
            index: story.sentenceCount},
            function(err, sentences) {
              if (err) {
                console.log(err);
              } else {
                socket.emit('sentences', {
                  sentences: _.map(sentences, function(s) {
                    return {
                      score: s.score,
                      content: s.content,
                      idnum: s.id,
                      upvoted: containsVoter(s.upvotes, user.id),
                      downvoted: containsVoter(s.downvotes, user.id)
                    };
                  }),
                  next_update: update_time - new Date()
                });
              }
            });
        }
      });
    });

    socket.on('upvote', function(val) {
      Sentence.upvote(val, user.id, function(err) {
        Sentence.findOne({'_id' : val}).exec(function(err, sentence) {
          io.sockets.emit('score_update', {
            idnum: sentence.id,
            score: sentence.score
          });
        });
      });
    });

    socket.on('downvote', function(val) {
      Sentence.downvote(val, user.id, function(err) {
        Sentence.findOne({'_id' : val}).exec(function(err, sentence) {
          io.sockets.emit('score_update', {
            idnum: sentence.id,
            score: sentence.score
          });
        });
      });
    });

    socket.on('new_sentence', function(val) {
      // Don't allow empty sentences
      if (val.trim().length == 0) {
        return;
      }
      Story.getCurrentStory(function(err, story) {
        if (err) {
          console.log(err);
        } else {
          if (story == null) {
            socket.emit('no_story');
            return;
          }
          new Sentence({
            content: val.trim(),
            submitter: user.id,
            story: story.id,
            index: story.sentenceCount
          }).save(function(err, sentence) {
            if (err) {
              console.log(err);
            } else {
              io.sockets.emit('sentence', {
                content: sentence.content,
                score: sentence.score,
                idnum: sentence.id
              });
              socket.emit('sentence_confirm');
            }
          });
        }
      });
    });

    socket.on('force_update', function() {
      Story.appendSentence(function(err, sentence) {
        io.sockets.emit('story_update', sentence);
      });
    });

  });

  return io;

}
