const mongoose = require('mongoose');
const argon2 = require('argon2');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  preferences: {
    savedNews: [{
      url: String,
      title: String,
      description: String,
      publishedAt: Date,
      source: {
        name: String
      },
      urlToImage: String,
      savedAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar la password antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

// Comparar password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('User', UserSchema);