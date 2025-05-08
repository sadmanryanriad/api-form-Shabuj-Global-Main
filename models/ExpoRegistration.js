const mongoose = require("mongoose");

const ExpoRegistration = new mongoose.Schema(
  {
    // Step 1: Personal information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    countryCode: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    citizenship: {
      type: String,
      required: true,
    },
    residence: {
      type: String,
    },

    // Step 2: Study Preferences
    // Preferred Study Destinations
    studyDestinations: {
      type: [String],
      default: [],
    },
    otherStudyDestination: {
      type: String,
    },
    // Preferred Study Level
    preferredStudyLevel: {
      type: String,
    },
    otherStudyLevel: {
      type: String,
    },

    // Step 3: Academic History
    academicHistory: {
      type: [
        {
          qualification: { type: String },
          year: { type: String },
          grade: { type: String },
          subject: { type: String },
          institution: { type: String },
        },
      ],
      default: [],
    },

    // Step 4: English Proficiency
    englishTest: {
      type: String,
    },
    englishScore: {
      type: String,
    },
    noEnglishCert: {
      type: Boolean,
      default: false,
    },

    // Work Experience
    workExperience: {
      type: String,
      default: "No",
    },
    workDetails: {
      type: String,
    },
    eventSourceLink: {
      type: String,
      trim: true,
    },
    eventId: {
      type: String,
      trim: true,
    },
    eventSourceName: {
      type: String,
      trim: true,
    },
    referralCode: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: [
        {
          label: { type: String, trim: true },
          value: { type: mongoose.Schema.Types.Mixed },
        },
      ],
      default: [],
    },
    
    // Optional: future-proof
    consentToTerms: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("ExpoRegistration", ExpoRegistration);











// "additionalInfo": [
//   {
//     "label": "How did you hear about the event?",
//     "value": "Facebook"
//   },
//   {
//     "label": "Are you bringing any guests?",
//     "value": 2
//   },
//   {
//     "label": "Special requirements",
//     "value": {
//       "dietary": "Vegetarian",
//       "accessibility": true
//     }
//   },
//   {
//     "label": "Follow-up Preferences",
//     "value": ["Email", "Phone"]
//   }
// ]


