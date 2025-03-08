const WelcomeModal = require("../models/WelcomeModal");

exports.getWelcomeModal = async (req, res) => {
    try {
        const welcomeModal = await WelcomeModal.findOne();

        if (!welcomeModal) {
            return res.status(404).json({ exist: false, message: "Welcome Modal not found in the database" });
        }

        res.status(200).json({ data: welcomeModal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateWelcomeModal = async (req, res) => {
    try {
        const { largeImageURL, phoneImageURL, formLink } = req.body;

        if (!largeImageURL || !phoneImageURL || !formLink) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the WelcomeModal already exists
        let welcomeModal = await WelcomeModal.findOne();

        if (welcomeModal) {
            // If it exists, update it
            welcomeModal = await WelcomeModal.findOneAndUpdate(
                {},
                { largeImageURL, phoneImageURL, formLink },
                { new: true }
            );
        } else {
            // If it doesn't exist, create a new one
            welcomeModal = new WelcomeModal({ largeImageURL, phoneImageURL, formLink });
            await welcomeModal.save();
        }

        res.status(200).json({ message: "Welcome Modal updated successfully", data: welcomeModal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
