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
        const { largeImageURL, phoneImageURL, formLink, expiresAt } = req.body;

        if (!largeImageURL || !phoneImageURL || !formLink) {
            return res.status(400).json({ message: "largeImageURL, phoneImageURL and formLink are required" });
        }

        const updateData = { largeImageURL, phoneImageURL, formLink };

        // Add expiresAt only if it's present in the request (can be null or a date string)
        if (expiresAt !== undefined) {
            updateData.expiresAt = expiresAt;
        }

        let welcomeModal = await WelcomeModal.findOne();

        if (welcomeModal) {
            welcomeModal = await WelcomeModal.findOneAndUpdate({}, updateData, { new: true });
        } else {
            welcomeModal = new WelcomeModal(updateData);
            await welcomeModal.save();
        }

        res.status(200).json({ message: "Welcome Modal updated successfully", data: welcomeModal });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

