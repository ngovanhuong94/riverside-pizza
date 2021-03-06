const express               = require('express');
const path                  = require('path');
const favicon               = require('serve-favicon');
const logger                = require('morgan');
const cookieParser          = require('cookie-parser');
const bodyParser            = require('body-parser');
const expressHbs            = require('express-handlebars');
const mongoose              = require('mongoose');
const session               = require('express-session');
const passport              = require('passport');
const flash                 = require('connect-flash');
const validator             = require('express-validator');
const MongoStore            = require('connect-mongo')(session);
const methodOverride        = require('method-override');

// required routes
const routes                = require('./routes/index');
const userRoutes            = require('./routes/user');
const adminRoutes           = require('./routes/admin');

// required for env vars
require('dotenv').config();

const app                   = express();

// hide power for site
app.disable('x-powered-by');

// connect to database
mongoose.connect(process.env.DATABASE || 'mongodb://localhost/riverside-pizza',
{ useMongoClient: true });
const db = mongoose.connection;
db.on("open", function(ref) {
  console.log("Connected to mongo server.");
});
db.on("error", function(err) {
  console.log("Could not connect to mongo server.");
  console.error(err);
});

// require passport
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// uncomment if in development mode
// app.use(logger('dev'));

// use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(validator());

// use to parse cookie
app.use(cookieParser());

// settings for session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 } // 3 hours
}));

// use flash to handle messages from back end
app.use(flash());

// start up passport
app.use(passport.initialize());

// start up session
app.use(passport.session());

// set up and use public files
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  // middleware authenticate user and store in locals
  res.locals.login = req.isAuthenticated();
  // middleware authenticate admin and store in locals
  if (req.isAuthenticated()) {
    res.locals.admin = req.user._id.toString() === process.env.ADMIN ? true : false;
  }
  // store session in local session
  res.locals.session = req.session;
  next();
});

// override methods for form method
app.use(methodOverride('_method'));

// routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
