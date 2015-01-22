var mongoose = require('mongoose'),
User = mongoose.model('User'),
Story = mongoose.model('Story'),
Sentence = mongoose.model('Sentence'),
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
  requireAuth(req, res, function(){
    if (req.user.accessLevel == null || req.user.accessLevel < 2) {
      req.flash('error', "You don't have permission to do that.");
      res.redirect('/');
    } else {
      // user is admin, proceed!
      return next();
    }});
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

  app.get('/admin', requireAdmin, function(req,res) {
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

  app.post('/new/story', requireAdmin, function(req, res) {
    var raw_sentences = req.body.text.match(/[^\.!\?]+[\.!\?]+/g);
    var sentences = _.map(raw_sentences, function(s) {
      return {
        content: s.trim(),
        submitter: req.user.id
      };
    });
    Sentence.create(sentences, function(err) {
      if (err) {
        console.log(err);
      } else {
        var saved = _.values(arguments).splice(1);
        Story.updateCurrentStory(req.body.current, function(err) {
          if (err) {
            console.log(err);
          }
          new Story({
            sentenceCount : saved.length,
            sentences: _.map(saved, function(e) {
              return e['_id'];
            }),
            title: req.body.title,
            isCurrent: req.body.current
          }).save(function(err) {
            req.flash('info', "New story successfully saved.");
            return res.redirect('/');
          });
        });
      }
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