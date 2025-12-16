const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    ownerId: { type: String }, // Clerk user ID (optional for unowned rooms)
    name: { type: String, default: "Untitled Project" },
    lang: { type: String, default: "JavaScript" },
    files: { type: Object, default: {} }, // Key: filename, Value: content
    createdAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);
