var passport = require('passport'),
FacebookStrategy = require('passport-facebook').Strategy,
User = require('./models/user');

module.exports = function(app) {

  // authentication
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.host + ":" + config.port + "/auth/facebook/cb"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({facebookId: profile.id}, function(err, user){
      if (err){
        return done(err);
      }
      else if (user){
        return done(null,user);
      }
      else {
        var newUser = new User({
          facebookId: profile.id,
          name: {
            first: profile.name.givenName,
            last: profile.name.familyName
          },
          email: profile.email
        });
        newUser.save(function(err, result){
          if (err){
            return done(err);
          }
          else {
            return done(null, newUser);
          }
        });
        newUser = null;
      }
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, done);
});

}
