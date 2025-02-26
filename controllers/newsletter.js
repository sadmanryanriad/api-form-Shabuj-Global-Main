const Newsletter = require("../models/Newsletter");

// Subscribe to Newsletter
exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if email already exists
        const existingSubscriber = await Newsletter.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ message: "Email is already subscribed" });
        }

        // Save new subscriber
        const newSubscriber = new Newsletter({ email });
        await newSubscriber.save();

        return res.status(201).json({ message: "Successfully subscribed to the newsletter" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all Newsletter Subscribers
exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().select("-__v");

        if (subscribers.length === 0) {
            return res.status(404).json({ message: "No subscribers found" });
        }

        return res.json({
            totalSubscribers: subscribers.length,
            subscribers,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
