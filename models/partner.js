const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// a model using the schema which is used to instantiate documents for mongodb
// 1st argument must be the captialized and singular version of the collection
// 2nd argument is schema used for the collection
const Partner = mongoose.model('Partner', partnerSchema)

module.exports = Partner;