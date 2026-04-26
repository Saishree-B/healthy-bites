const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    // NEW: User profile fields
    height: { type: Number, default: 0 }, // in cm
    weight: { type: Number, default: 0 }, // in kg
    age: { type: Number, default: 0 },
    // NEW: Calculated goals
    dailyCalorieGoal: { type: Number, default: 0 },
    dailyCarbGoal: { type: Number, default: 0 }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);