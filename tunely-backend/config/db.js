const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect('mongodb://localhost/tunely', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB connected'));
};