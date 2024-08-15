// const nodemailer = require("nodemailer");

// const sendMail = async (options) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMPT_HOST,
//         port: process.env.SMPT_PORT,
//         service: process.env.SMPT_SERVICE,
//         auth:{
//             user: process.env.SMPT_MAIL,
//             pass: process.env.SMPT_PASSWORD,
//         },
//     });

//     const mailOptions = {
//         from: process.env.SMPT_MAIL,
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     };

//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendMail;

require("dotenv").config();
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: parseInt(process.env.SMPT_PORT || '587'),
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const { email, subject, template, data } = options;

    const templatePath = path.join(__dirname, "../mails", template);

    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: email,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
