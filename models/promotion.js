const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
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
    cost: {
        type: Currency,
        required: true,
        min: 0
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
const Promotion = mongoose.model('Promotion', promotionSchema)

module.exports = Promotion;