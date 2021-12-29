var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
app.use(cookieParser());

// basic authentication using a custom middleware function
function auth(req, res, next) {
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    
    // checks if received any authentication
    if (!authHeader) {
        const err = new Error('You are not authenticated!');

        // lets the client know the server requests basic authentiation
        res.setHeader('WWW-Authenticate', 'Basic');
        
        err.status = 401;
        return next(err);
    }

    // method parses authHeader for username and password and storeds in the auth array
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user === 'admin' && pass === 'password') {
        
        // authorized and pass control to next middleware function
        return next();
    } else {
        const err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
    }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
