// this code configures Passport and Passport-Local using the strategy LocalStrategy for username/password authentication

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// requires the User model with passport-local-mongoose plugged into it
const User = require('./models/user');

// passport.use() - passport is using the strategy LocalStrategy
// LocalStrategy is a constructor that takes a verifyCallback function
// User.authenticate is the verifyCallback function from passport-local-mongoose that checks if user exists and passport matches
exports.local = passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of the User model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());