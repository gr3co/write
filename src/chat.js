module.exports = function(io) {

  var chat = io.of('/chat');

  chat.on('connection', function(socket) {

    // for auth related purposes
    var user = socket.conn.request.user;

    console.log(user.name.first + " connected!");

    socket.on('disconnect', function() {
      console.log(user.name.first + " disconnected!");
    });

  });

}
