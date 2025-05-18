const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: { type: String, required: false, default: '' }, 
    content: { type: String, required: true }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    isLocked: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true }); // Tự động cập nhật createdAt, updatedAt

module.exports = mongoose.model('Note', noteSchema);