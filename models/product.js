const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: String,
    image: String,
    stockCount: {
        type: Number,
        required: true
    }
})

exports.Product = mongoose.model('Product', productSchema);