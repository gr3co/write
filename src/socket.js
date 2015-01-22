var express = require('express'), 
passportSocketIo = require("passport.socketio"),
Sentence = require('mongoose').model('Sentence');


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

  //force authorization before handshaking
  io.set('authorization', passportSocketIo.authorize({
    cookieParser: express.cookieParser,
    secret: config.cookie.secret,
    store: cstore,
    success: acceptConnection,
    fail: rejectConnection
  }));

  io.sockets.on('connection', function(socket) {

    // for auth related purposes
    var user = socket.conn.request.user;

    socket.on('new_sentence', function(val) {
      new Sentence({
        content: val.trim(),
        submitter: user.id
      }).save(function(err, sentence) {
        if (err) {
          console.log(err);
        } else {
          socket.emit('sentence', {
            content: sentence.content,
            score: sentence.score
          });
        }
      });
    });

  });

}
