const mongoose = require("mongoose");

const welcomeModalSchema = new mongoose.Schema({
    largeImageURL: { type: String, required: true },
    phoneImageURL: { type: String, required: true },
    formLink: { type: String, required: true },
    expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("WelcomeModal", welcomeModalSchema);
