const nodemailer = require('nodemailer');
const {EMAIL_ACCOUNT, EMAIL_SECRET, EMAIL_FROM_ADDR} = require('../config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_ACCOUNT,
        pass: EMAIL_SECRET
    }
});

const mailOptions = {
    from: EMAIL_FROM_ADDR,
    to: 'zirconlegal@gmail.com',
    subject: 'Test',
    //text: 'That was easy!',
    text: {path: '/home/claudio/monax/monax-integration/src/email/resguardo.html'},
    attachments: [
        {   // utf-8 string as an attachment
            filename: 'resguardo.html',
            //content: 'hello world!',
            path: '/home/claudio/monax/monax-integration/src/email/resguardo.html'
        },
        ]
};

transporter.sendMail(mailOptions, function(error, info){
    console.log('mailOptions', mailOptions);

    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
