const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect('mongodb+srv://test:test@cluster0.bbukho8.mongodb.net/').then(() => {
    console.log('Connected to MongoDB');
})
}

//exporting the connectDB function
module.exports = connectDB;