const Enquire = require("../models/Enquire");
const sendEmail = require("../utils/sendEmail");

const enquire = async (req, res) => {
  const { subject, email, message } = req.body;

  try {
    // Create a new enquire document
    const newEnquire = new Enquire({
      subject,
      email,
      message,
    });
    await newEnquire.save();

    // Prepare email content
    const mailTo = process.env.SEND_EMAIL_TO; // Recipient email
    const mailSubject = `New Enquiry: ${subject}`;
    const mailText = `You have received a new enquiry from ${email}.`;
    const mailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; border-radius: 5px; overflow: hidden; background-color: #f9f9f9;">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">New Enquiry Received</h2>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; color: #333;"><strong>Subject:</strong> ${subject}</p>
        <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${email}</p>
        <p style="font-size: 16px; color: #333;"><strong>Message:</strong></p>
        <p style="font-size: 14px; color: #555;">${message}</p>
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

    // Send response back to client immediately
    res.send("Enquire stored successfully!");
  } catch (err) {
    console.error("Error processing enquiry: ", err);
    res.status(500).send("Error saving the enquire: " + err.message);
  }
};

module.exports = enquire;
