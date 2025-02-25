const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({
  country: { type: String, required: true },
  offices: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Unique ID for each office
      city: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String },
      email: { type: String },
      timestamps: [{ type: Date, default: Date.now }] // Store all update timestamps
    }
  ]
}, { timestamps: true });

const Office = mongoose.model("Office", officeSchema);
module.exports = Office;
