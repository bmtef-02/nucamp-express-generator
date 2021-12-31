// this code configures Passport and Passport-Local using the strategy LocalStrategy for username/password authentication

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// requires the User model with passport-local-mongoose plugged into it
const User = require('./models/user');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;  // provides many functions to extract tokens from a request 
const jwt = require('jsonwebtoken');    // node module used to create, sign, verify tokens

const config = require('./config.js');

// passport.use() - passport is using the strategy LocalStrategy
// LocalStrategy is a constructor that takes a verifyCallback function
// User.authenticate is the verifyCallback function from passport-local-mongoose that checks if user exists and passport matches
exports.local = passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of the User model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// a function that returns a token
exports.getToken = user => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

// object contains options for the JwtStrategy
const opts = {};

// option that the server expects a bearer token in an authorization header
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

// option sets secret key to JwtStrategy to verify token signature
opts.secretOrKey = config.secretKey;

// export JwtStrategy 
exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);

            // checks the users collection for a document matching the jwt_payload object's id
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {  // error
                    return done(err, false);
                } else if (user) {  // no error, user found
                    return done(null, user);
                } else {    // no error, no user found
                    return done(null, false);
                }
            });
        }
    )
);

// shortcut we can use whenever we want to authenticate with the jwt strategy, not with sessions
exports.verifyUser = passport.authenticate('jwt', {session: false});