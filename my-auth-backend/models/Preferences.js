const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, unique: true },
    fontSize: { type: String, default: '16px' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    noteColor: { type: String, default: '#ffffff' },
    viewMode: { type: String, enum: ['grid', 'list'], default: 'grid' } // Thêm trường viewMode
});

const Preferences = mongoose.model('Preferences', preferencesSchema);

module.exports = Preferences;