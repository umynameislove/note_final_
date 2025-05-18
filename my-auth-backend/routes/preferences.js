const express = require('express');
const router = express.Router();
const Preferences = require('../models/Preferences');

const initPreferences = async () => {
    try {
        const User = require('./auth').User;
        const users = await User.find();
        for (const user of users) {
            const exists = await Preferences.findOne({ userEmail: user.email });
            if (!exists) {
                const newPreferences = new Preferences({
                    userEmail: user.email,
                    fontSize: "16px",
                    theme: "light",
                    noteColor: "#ffffff",
                    viewMode: "grid" 
                });
                await newPreferences.save();
            }
        }
        console.log("Initialized preferences for existing users.");
    } catch (error) {
        console.error("Error initializing preferences:", error);
    }
};

router.use((req, res, next) => {
    initPreferences().then(() => next()).catch(next);
});

router.get('/preferences', async (req, res) => {
    const { email } = req.query;
    try {
        const preferences = await Preferences.findOne({ userEmail: email });
        if (!preferences) {
            return res.status(404).json({ message: 'Preferences not found' });
        }
        res.json({ preferences });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/preferences', async (req, res) => {
    const { email, fontSize, theme, noteColor, viewMode } = req.body;
    try {
        let preferences = await Preferences.findOne({ userEmail: email });
        if (!preferences) {
            preferences = new Preferences({ userEmail: email });
        }
        preferences.fontSize = fontSize || preferences.fontSize;
        preferences.theme = theme || preferences.theme;
        preferences.noteColor = noteColor || preferences.noteColor;
        preferences.viewMode = viewMode || preferences.viewMode; // Cập nhật viewMode
        await preferences.save();
        res.json({ message: 'Preferences updated', preferences });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;