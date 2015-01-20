var mongoose = require('mongoose'),
User = mongoose.model('User'),
Story = mongoose.model('Story'),
_ = require('underscore'),
passport = require('passport');

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash('error', "You need to log in to do that.");
    res.redirect('/');
  } else {
    // user is authenticated!
    return next();
  }
}

function requireAdmin(req, res, next) {
  if (req.user.accessLevel == null || req.user.accessLevel < 2) {
    req.flash('error', "You don't have permission to do that.");
    res.redirect('/');
  } else {
    // user is admin, proceed!
    return next();
  }
}

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.locals.user = req.user;
    return next();
  });

  app.get('/', function(req, res) {
    Story.getCurrentStory(function(err, story) {
      if (err) {
        console.log(err);
      }
      res.render('home', {
        errors: req.flash('error'),
        info: req.flash('info'),
        story: story
      });
    });
  });

  app.get('/admin', 
    requireAuth, requireAdmin, 
    function(req, res) {
      res.render('admin', {
        errors: req.flash('error'),
        info: req.flash('info')
      });
  });

  app.get('/login', function(req, res) {
    res.render('login', {
      errors: req.flash('error'),
      info: req.flash('info')
    });
  });

  app.get('/auth/facebook', 
    passport.authenticate('facebook', { scope: ['email'] }));

  app.get('/auth/facebook/cb',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

  app.get('/logout', requireAuth, function(req, res) {
    req.logout();
    res.redirect('/');
  });

};