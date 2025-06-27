const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true // optional, prevents duplicates like "Level 1"
  },
  order: {
    type: Number, 
    required: true,
    unique: true // ensures order is unique
  },
}, {
  timestamps: true,
});

const Level = mongoose.model('Level', levelSchema);

module.exports = Level;
