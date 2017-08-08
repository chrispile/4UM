var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('client-sessions');
var pgSetup = require('./pgSetup.js');
var index = require('./routes/index');
var users = require('./routes/users');
var sub4ums = require('./routes/sub4ums');
var posts = require('./routes/posts')

pgSetup.connect();
var pgClient = pgSetup.getClient();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session setup
app.use(session({
  cookieName:'session',
  secret: 'random-string-goes-here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
        var queryConfig = {
            text: "SELECT * FROM Users WHERE username=$1",
            values: [req.session.user.username]
        }
        pgClient.query(queryConfig, function(err, result) {
        if (result.rows.length != 0) {
            req.user = result.rows[0];
            delete req.user.password;
            req.session.user = result.rows[0];
            res.locals.user = result.rows[0];
        }
        next();
        });
    } else {
        next();
    }
});


app.use('/', index);
app.use('/users', users);
app.use('/sub4ums', sub4ums);
app.use('/posts', posts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
