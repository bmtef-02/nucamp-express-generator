const express = require('express');
const { reap } = require('session-file-store/lib/session-file-helpers');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();


/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find()
    .then(users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        
        // sends json data to client in response stream and auto closes response stream. Replaces res.end
        res.json(users);
    })
    // next() pass off err to Express error handler. Express will handle the error
    .catch(err => next(err));
});

// /users/signup endpoint allows new user to register using passport-local-mongoose
router.post('/signup', (req, res) => {

    // register() method registers a new user with a given password and checks if username is unique
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        (err, user) => {    // callback that checks for errros in register()
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                if (req.body.firstname) {   // checks if a firstname was sent in the req.body
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save(err => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'applicatin/json');
                        res.json({err: err});
                        return;
                    }

                    // passport authenticates new user using 'local' strategy
                    // (req, res, ()) function gets called if authentication was successful
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: 'Registration Successful!'});
                    })
                })
            }
        }
    )
});

// /users/login endpoint allows user to login using passport
// passport.authenticate() handles user login, challenge user for credentials, parsing credentials from req.body
router.post('/login', passport.authenticate('local'), (req, res) => {

    // if passport.authenticate() is successful, middleware moves onto (req, res)
    const token = authenticate.getToken({_id: req.user._id});   // issue a token to the user
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
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
