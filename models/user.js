const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    // don't need username or password b/c passport-local-mongoose auto adds them, hashing, and salting them
    admin: {
        type: Boolean,
        default: false
    }
});

// plugin passport-local-mongoose into userSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);