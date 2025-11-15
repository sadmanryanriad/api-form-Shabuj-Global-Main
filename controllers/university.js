// controllers/university.js
const University = require("../models/University");

// CREATE UNIVERSITY
exports.createUniversity = async (req, res) => {
  try {
    const {
      name,
      universityUrl,
      img,
      gallery,
      videos,
      country,
      overview,
      location,
      rank,
      established,
      history,
      rankingAndAchievement,
      services,
      departmentAndFaculty,
      accommodation,
      internationalStudents,
      courseAndFees,
      relatedEventsUrl,
      relatedBlogsUrl,
      hasPartnershipWithSGE,
      othersInfo,
      cta,
      others,
    } = req.body;

    // Basic validation
    if (!name || !universityUrl || !img || !country) {
      return res.status(400).json({
        message:
          "Required fields are missing (name, universityUrl, img, country)",
      });
    }

    // Validate universityUrl slug
    const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(universityUrl);
    if (!isValidSlug) {
      return res.status(400).json({
        message:
          "Invalid university URL format. Use lowercase letters, numbers (0-9), and hyphens.",
      });
    }

    // Check URL uniqueness
    const exists = await University.findOne({ universityUrl });
    if (exists) {
      return res.status(400).json({ message: "University URL already exists" });
    }

    const newUni = new University({
      name,
      universityUrl,
      img,
      gallery,
      videos,
      country,
      overview,
      location,
      rank,
      established,
      history,
      rankingAndAchievement,
      services,
      departmentAndFaculty,
      accommodation,
      internationalStudents,
      courseAndFees,
      relatedEventsUrl,
      relatedBlogsUrl,
      hasPartnershipWithSGE,
      othersInfo,
      cta,
      others,
    });

    await newUni.save();

    res.status(201).json({
      message: "University created successfully",
      data: newUni,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE UNIVERSITY BY universityUrl
exports.updateUniversity = async (req, res) => {
  try {
    const { universityUrl } = req.params;
    const updates = req.body;

    const uni = await University.findOne({ universityUrl });

    if (!uni) {
      return res.status(404).json({ message: "University not found" });
    }

    // If URL is being changed, validate and ensure uniqueness
    if (updates.universityUrl && updates.universityUrl !== uni.universityUrl) {
      const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(
        updates.universityUrl
      );
      if (!isValidSlug) {
        return res.status(400).json({
          message:
            "Invalid university URL format. Use lowercase letters, numbers (0-9), and hyphens.",
        });
      }

      const existing = await University.findOne({
        universityUrl: updates.universityUrl,
      });
      if (existing && existing._id.toString() !== uni._id.toString()) {
        return res
          .status(400)
          .json({ message: "University URL already exists" });
      }
    }

    Object.keys(updates).forEach((key) => {
      uni[key] = updates[key];
    });

    await uni.save();

    res.status(200).json({
      message: "University updated successfully",
      data: uni,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE UNIVERSITY BY universityUrl
exports.deleteUniversity = async (req, res) => {
  try {
    const { universityUrl } = req.params;

    const uni = await University.findOneAndDelete({ universityUrl });

    if (!uni) {
      return res.status(404).json({ message: "University not found" });
    }

    res.status(200).json({
      message: "University deleted successfully",
      universityUrl: uni.universityUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UNIQUE URL CHECKER
exports.checkUniversityUrl = async (req, res) => {
  try {
    const { universityUrl } = req.params;

    const isValidSlug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(universityUrl);
    if (!isValidSlug) {
      return res.status(400).json({
        isUnique: false,
        message:
          "Invalid university URL format. Use lowercase letters, numbers (0-9), and hyphens.",
      });
    }

    const uni = await University.findOne({ universityUrl });

    if (uni) {
      return res.status(400).json({
        isUnique: false,
        message: "University URL already exists",
      });
    }

    res.status(200).json({
      isUnique: true,
      message: "University URL is available",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FETCH DISTINCT UNIVERSITY COUNTRY LIST
exports.getUniversityCountries = async (req, res) => {
  try {
    const countries = await University.distinct("country");

    res.status(200).json({
      count: countries.length,
      countries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FETCH UNIVERSITIES BY COUNTRY
exports.getUniversitiesByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    if (!country) {
      return res.status(400).json({ message: "Country is required" });
    }

    const universities = await University.find({ country })
      .sort({ name: 1 })
      .select("-__v");

    res.status(200).json({
      count: universities.length,
      universities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// OPTIONAL: GET SINGLE UNIVERSITY BY URL (useful for frontend)
exports.getUniversityByUrl = async (req, res) => {
  try {
    const { universityUrl } = req.params;

    const uni = await University.findOne({ universityUrl }).select("-__v");

    if (!uni) {
      return res.status(404).json({ message: "University not found" });
    }

    res.status(200).json(uni);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// OPTIONAL: GET ALL UNIVERSITIES
exports.getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find()
      .sort({ name: 1 })
      .select("-__v");

    res.status(200).json({
      count: universities.length,
      universities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
