const mongoose = require("mongoose");
const Office = require("../models/Office");

// Add a new office to a country
exports.addOffice = async (req, res) => {
    try {
        const { country } = req.query; // Using query parameter for country
        const { city, address, phone, email } = req.body;
        
        const newOffice = {
            _id: new mongoose.Types.ObjectId(),
            city,
            address,
            phone,
            email,
            timestamps: [new Date()] // First creation timestamp
        };

        const updatedOffice = await Office.findOneAndUpdate(
            { country },
            { $push: { offices: newOffice } },
            { new: true, upsert: true } // Upsert: Creates country if not exists
        );

        res.status(201).json({ message: "Office added successfully", updatedOffice });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a specific office inside a country
exports.updateOffice = async (req, res) => {
    try {
        const { country } = req.query; 
        const { officeId } = req.params; // Office ID remains in the URL
        const updates = req.body;

        // Find the office document by country and officeId
        const officeData = await Office.findOne({ country });

        if (!officeData) {
            return res.status(404).json({ message: "Country not found" });
        }

        // Find the specific office by officeId
        const office = officeData.offices.id(officeId);

        if (!office) {
            return res.status(404).json({ message: "Office not found" });
        }

        // Update the office details with the provided updates
        Object.assign(office, updates); // Apply partial updates to the office subdocument

        // Add a timestamp for the update
        office.timestamps.push(new Date());

        // Save the document with updated office data
        await officeData.save();

        res.json({ message: "Office updated successfully", updatedOffice: officeData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




// Delete an office from a country
exports.deleteOffice = async (req, res) => {
    try {
        const { country } = req.query; // Using query parameter for country
        const { officeId } = req.params;

        const updatedOffice = await Office.findOneAndUpdate(
            { country },
            { $pull: { offices: { _id: officeId } } },
            { new: true }
        );

        if (!updatedOffice) return res.status(404).json({ message: "Office not found" });

        res.json({ message: "Office deleted successfully", updatedOffice });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get office counts for each country with a total office count
exports.getOfficeCounts = async (req, res) => {
    try {
        // Fetch all offices data
        const allOffices = await Office.find();

        if (!allOffices || allOffices.length === 0) {
            return res.status(404).json({ message: "No offices found" });
        }

        // Calculate office count for each country dynamically
        const officeCounts = allOffices.map(office => ({
            country: office.country,
            officeCount: office.offices.length
        }));

        // Calculate the total office count
        const totalOffices = officeCounts.reduce((sum, office) => sum + office.officeCount, 0);

        return res.json({
            totalOffices,
            officeCounts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all offices or a specific country's offices based on query params
exports.getOfficesByCountry = async (req, res) => {
    try {
        const { country } = req.query;

        // If a country is provided in the query, find that country's offices
        if (country) {
            const officeData = await Office.findOne({ country });

            if (!officeData) return res.status(404).json({ message: "Country not found" });

            return res.json(officeData);
        }

        // If no country is provided, return all offices in the database
        const allOffices = await Office.find();

        if (!allOffices || allOffices.length === 0) {
            return res.status(404).json({ message: "No offices found" });
        }

        return res.json(allOffices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

