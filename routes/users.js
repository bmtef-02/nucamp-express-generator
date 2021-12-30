const express = require('express');
const { reap } = require('session-file-store/lib/session-file-helpers');
const User = require('../models/user');
const passport = require('passport');

const router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// /users/signup endpoint allows new user to register using passport-local-mongoose
router.post('/signup', (req, res) => {

    // register() method registers a new user with a given password and checks if username is unique
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        err => {    // callback that checks for errros in register()
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {

                // passport authenticates new user using 'local' strategy
                // (req, res, ()) function gets called if authentication was successful
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                })
            }
        }
    )
});

// /users/login endpoint allows user to login using passport
// passport.authenticate() handles user login, challenge user for credentials, parsing credentials from req.body
router.post('/login', passport.authenticate('local'), (req, res) => {

    // if passport.authenticate() is successful, middleware moves onto (req, res)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'You are successfully logged in!'});
});

// /users/logout endpoint allows user to logout
router.get('/logout', (req, res, next) => {
    
    // checks if a session exists
    if (req.session) {

        // deleting session server side
        req.session.destroy();

        // clear the cookie stored on the client
        res.clearCookie('session-id');

        // redirects user to route path localhost:3000/
        res.redirect('/');
    } else {    // if user is trying to logout without being logged in
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});

module.exports = router;
