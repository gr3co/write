var express = require('express'),
  exphbs = require('express-handlebars'),
  mongoose = require('mongoose'),
  MongoStore = require('connect-mongo')(express),
  flash = require('connect-flash'),
  expressValidator = require('express-validator'),
  env = process.env.NODE_ENV || 'development',
  useragent = require('express-useragent'),
  sass = require('node-sass-middleware'),
  fs = require('fs'),
  util = require('util');

GLOBAL.config = require('./src/config')[env];

var cstore = new MongoStore(config.db);

// create and configure express app
var app = express();

// use handlebar templates with extension .html
var hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.html',
  helpers: {}
});

app.engine('html', hbs.engine);
app.set('view engine', 'html');

app.set('port', config.port);
app.set('title', config.name);

// middlewares
app.use(express.logger('dev'));

// compress responses with gzip/deflate
app.use(express.compress());

// validation
app.use(expressValidator());
// cookies
app.use(express.cookieParser());

// parsing
app.use(express.json());
app.use(express.urlencoded());

// use MongoDB to hold session data
app.use(express.session({
  secret: config.cookie.secret,
  maxAge: config.cookie.maxAge,
  store: cstore
}));

// flash message support
app.use(flash());

// check the user agent
app.use(useragent.express());

if (env === 'development' || env === 'test') {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
} else if (env === 'production') {
  app.use(express.errorHandler());
}

// compile dat scss
app.use(sass({
  src: __dirname, 
  dest: __dirname + '/public',
  outputStyle: 'compressed'  
}));  


// allow public stuff
app.use(express.static(__dirname + '/public'));

// initialize passport
require('./src/passport')(app);

// attach routes
require('./src/routes')(app);

function dburl(options) {
  return 'mongodb://' + options.host + '/' + options.db;
}

mongoose.connect(dburl(config.db));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {

  console.log("Database connection open");

  // set up server
  var server = require('http').createServer(app);

  // initialize socket.io
  require('./src/socket')(server, cstore);

  server.listen(app.get('port'));
  console.log("Web server listening on port " + app.get('port'));

});

exports = module.exports = app;
