const mongoose = require("mongoose");

const modalRegistrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    interestedCourse: { type: String},
    country: { type: String}
}, { timestamps: true });

module.exports = mongoose.model("ModalRegistration", modalRegistrationSchema);
