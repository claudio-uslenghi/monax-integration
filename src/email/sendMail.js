const nodemailer = require('nodemailer');
const {EMAIL_ACCOUNT, EMAIL_SECRET, EMAIL_FROM_ADDR} = require('../config');
const {loadTemplate} = require('./templateLoader');
const TO_EMAIL = 'zirconlegal@gmail.com';


const fs = require('fs');
const pdf = require('html-pdf');
const html = fs.readFileSync('/home/claudio/monax/monax-integration/src/email/templates/resguardo.html', 'utf8');
const options = {format: 'Letter'};

/*
pdf.create(html, options).toFile('/home/claudio/monax/monax-integration/src/email/templates/resguardo.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
    return res;
});
*/


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_ACCOUNT,
        pass: EMAIL_SECRET
    }
});


module.exports = {
    createPdf: () => {
        pdf.create(html, options).toFile('/home/claudio/monax/monax-integration/src/email/templates/resguardo.pdf', function (err, res) {
            if (err) return console.log(err);
            console.log(res); // { filename: '/app/businesscard.pdf' }
            return res;
        });
    },
    sendTemplate: (templateName, subject, toEmail, params) => {
        return loadTemplate(
            templateName, params
        ).then(
            (content) => {

                pdf.create(content, options).toFile('/home/claudio/monax/monax-integration/src/email/templates/resguardo.pdf',
                    function (err, res) {
                        if (err) return console.log(err);
                        console.log("se creo pdf"); //

                        return new Promise(
                            (resolve, reject) => {
                                transporter.sendMail(
                                    {
                                        from: EMAIL_FROM_ADDR,
                                        to: toEmail,
                                        subject: subject,
                                        text: content,
                                        html: content,
                                        attachments: [
                                            {
                                                filename: 'resguardo.pdf',
                                                path: '/home/claudio/monax/monax-integration/src/email/templates/resguardo.pdf'
                                            },
                                        ]
                                    },
                                    (err, info) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(info);
                                        }
                                    }
                                );
                            }
                        );




                    });



            }
        );
    },
};
