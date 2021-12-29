var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

// this is returning another function as it's return value and we call the session function with the 2nd parameter
const FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

// sets up connection to nucampsiteServer in the mongodb server
const url = 'mongodb://localhost:27017/nucampsite';

// connects mongodb client to nucampsiteServer
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// if connect promise resolves, log confirmation message via 1st argument
// if connect promise fails, log err message via the 2nd argument
// different syntax of .then() and .catch()
connect.then(() => console.log('Connected correctly to server'),
    err => console.log(err)
);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// don't need cookieParser anymore b/c using express-session
// app.use(cookieParser('12345-67890-09876-54321'));   // cookParser has a secret key - using a signed cookie

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,

    // creates new FileStore as object that we use to save session info to server's hard disk
    store: new FileStore()
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// basic authentication using a custom middleware function
function auth(req, res, next) {

    console.log(req.session);

    // checks if request has session with a user field
    if (!req.session.user) {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    } else {
        if (req.session.user === 'authenticated') {
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
    }
};

app.use(auth); // anything below this must require authentication

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
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
