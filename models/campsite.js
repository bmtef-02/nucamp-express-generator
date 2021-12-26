const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

// instantiate new object that will hold comments about a campsite
const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    // will add properties createAt and updatedAt with the time it was created
    timestamps: true
});

// instantiate new object named campsiteSchema
const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    // adding commentSchema as a subdoc
    comments: [commentSchema]
}, {
    // will add properties createAt and updatedAt with the time it was created
    timestamps: true
});

// a model using the schema which is used to instantiate documents for mongodb
// 1st argument must be the captialized and singular version of the collection - mongoose will look for campsites collection
// 2nd argument is schema used for the collection
const Campsite = mongoose.model('Campsite', campsiteSchema)

module.exports = Campsite;