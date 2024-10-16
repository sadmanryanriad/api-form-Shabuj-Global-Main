const Apply = require("../models/Apply");
const sendEmail = require("../utils/sendEmail");

const apply = async (req, res) => {
  const { name, email, phoneNumber, studyDestination, studyYear, studyIntake } =
    req.body;

  try {
    // Create a new Apply document
    const newApply = new Apply({
      name,
      email,
      phoneNumber,
      studyDestination,
      studyYear,
      studyIntake,
    });

    await newApply.save();

    res.status(201).json({
      message: "Apply created successfully",
    });

    // Send email notification
    const mailTo = process.env.SEND_EMAIL_TO;
    const mailSubject = "New Application Received";
    const mailText = `New application received from ${name}`;
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; border-radius: 5px; overflow: hidden; background-color: #f9f9f9;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">New Application Received</h2>
        </div>
        <div style="padding: 20px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone Number:</strong> ${phoneNumber}</p>
          <p><strong>Study Destination:</strong> ${studyDestination}</p>
          <p><strong>Study Year:</strong> ${studyYear}</p>
          <p><strong>Study Intake:</strong> ${studyIntake}</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center;">
          <p style="font-size: 12px; color: #777;">This email was generated automatically. Please do not reply.</p>
        </div>
      </div>
    `;
    // Send the email in the background
    sendEmail(mailTo, mailSubject, mailText, mailHtml)
      .then(() => {
        console.log("Email sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending email: ", error);
      });
  } catch (error) {
    console.error("Error processing apply info: ", error);
    res.status(500).send("Error saving the apply info: " + error.message);
  }
};

module.exports = apply;
