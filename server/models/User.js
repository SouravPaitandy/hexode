const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String },
    rooms: [{ type: String }], // Array of roomIds owned or joined
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
