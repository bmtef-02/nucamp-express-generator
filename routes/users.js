const express = require('express');
const { reap } = require('session-file-store/lib/session-file-helpers');
const User = require('../models/user');

const router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// /users/signup endpoint allows new user to register 
router.post('/signup', (req, res, next) => {

    // checks all User models for matching user document names
    User.findOne({username: req.body.username})
    .then(user => {
        if (user) {
            const err = new Error(`User ${req.body.username} already exists!`);
            err.status = 403;
            return next(err);
        } else {
            
            // creates new user document
            User.create({
                username: req.body.username,
                password: req.body.password
            })
            .then(user => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'Registration Successful', user: user})
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
});

// /users/login endpoint allows user to login
router.post('/login', (req, res, next) => {

    // check if user is already logged in by checking if tracking an authenticated session
    if (!req.session.user) {
        const authHeader = req.headers.authorization;
    
        // checks if received any authentication
        if (!authHeader) {
            const err = new Error('You are not authenticated!');

            // lets the client know the server requests basic authentiation
            res.setHeader('WWW-Authenticate', 'Basic');
            
            err.status = 401;
            return next(err);
        }

        // method parses authHeader for username and password and stored in the auth array
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];

        // looks for user document matching username and password properties
        User.findOne({username: username})
        .then(user => {
            if (!user) {
                const err = new Error(`User ${username} does not exist!`);
                err.status = 401;
                return next(err);
            } else if (user.password != password) {
                const err = new Error('Your password is incorrect!');
                err.status = 401;
                return next(err);
            } else if (user.username === username && user.password === password) {
                req.session.user = 'authenticated';
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You are authenticated!');
            }
        })
        .catch(err => next(err));
    } else {    // client already logged in
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated');
    }
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
