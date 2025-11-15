const mongoose = require("mongoose");

const courseAndFeeSchema = new mongoose.Schema(
  {
    course: { type: String, required: true },
    courseFee: { type: String, required: true },
    courseDuration: { type: String, required: true }
  },
  { _id: false }
);

const othersInfoSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

// CTA STRUCTURE
const ctaSchema = new mongoose.Schema(
  {
    title: { type: String },
    buttonText: { type: String },
    buttonUrl: { type: String },
    isFormHidden: { type: Boolean, default: false }
  },
  { _id: false }
);

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    universityUrl: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    },

    img: { type: String, required: true },

    gallery: { type: [String], default: [] },
    videos: { type: [String], default: [] },

    country: { type: String, required: true },
    overview: { type: String },
    location: { type: String },
    rank: { type: String },
    established: { type: String },

    history: { type: String },
    rankingAndAchievement: { type: String },
    services: { type: String },
    departmentAndFaculty: { type: String },
    accommodation: { type: String },
    internationalStudents: { type: String },

    courseAndFees: { type: [courseAndFeeSchema], default: [] },

    relatedEventsUrl: { type: [String], default: [] },
    relatedBlogsUrl: { type: [String], default: [] },

    hasPartnershipWithSGE: { type: Boolean, default: false },

    othersInfo: { type: [othersInfoSchema], default: [] },

    cta: ctaSchema,

    //(flexible)
    others: { type: mongoose.Schema.Types.Mixed, default: {} },

  },
  { timestamps: true }
);

module.exports = mongoose.model("University", universitySchema);
