const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true 
    }
});

module.exports = mongoose.model('Product', productSchema);