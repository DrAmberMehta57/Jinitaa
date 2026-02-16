const nodemailer = require('nodemailer');
const twilio = require('twilio');

/**
 * Service to handle Email and WhatsApp notifications
 */

// Email Transporter (Placeholder for User Config)
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send Confirmation Email
 */
async function sendConfirmationEmail(patientEmail, patientName, referenceID) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('EMAIL_USER or EMAIL_PASS not set. Email not sent.');
        return false;
    }

    const transporter = createEmailTransporter();

    const mailOptions = {
        from: `"Dr. Jinnit's Clinic" <${process.env.EMAIL_USER}>`,
        to: patientEmail,
        subject: `Appointment Confirmed - Ref: ${referenceID}`,
        html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2c3e50;">Hello ${patientName},</h2>
                <p>Thank you for choosing <strong>Dr. Jinnit's Clinic</strong>. We have received your case record form.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #7f8c8d;">Your Reference ID</p>
                    <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #2980b9;">${referenceID}</p>
                </div>
                
                <p>Dr. Jinita Galaiya will review your details shortly. Please keep this Reference ID for your records.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #95a5a6;">This is an automated confirmation message. Please do not reply to this email.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

/**
 * Send WhatsApp via Twilio (Requires Account)
 */
async function sendWhatsAppNotification(toPhone, patientName, referenceID) {
    const sid = process.env.TWILIO_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE; // Format: whatsapp:+14155238886

    if (!sid || !auth || !from) {
        console.warn('Twilio credentials not set. WhatsApp API message not sent.');
        return false;
    }

    const client = twilio(sid, auth);

    try {
        const message = await client.messages.create({
            from: from,
            to: `whatsapp:${toPhone}`,
            body: `Hello ${patientName}, thank you for submitting your case to Dr. Jinnit's Clinic. Your Reference ID is ${referenceID}. Dr. Jinita will review it soon.`
        });
        console.log('WhatsApp sent:', message.sid);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp via Twilio:', error);
        return false;
    }
}

/**
 * Generate Direct WhatsApp Link (Fallback/Manual)
 */
function getWhatsAppLink(phone, patientName, referenceID) {
    const message = `Hello Dr. Jinita, my name is ${patientName}. I have submitted my case record form. My Reference ID is ${referenceID}.`;
    const encodedMessage = encodeURIComponent(message);
    // Returning link formatted for user click
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
}

module.exports = {
    sendConfirmationEmail,
    sendWhatsAppNotification,
    getWhatsAppLink
};
