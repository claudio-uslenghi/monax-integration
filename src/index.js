'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates http server
const {TOKEN} = require('./config');
//const {sendEmail} = require('./email/sendMail');
const {sendTemplate, createPdf} = require('./email/sendMail');

app.listen(3000, () => console.log('Webhook is listening'));


app.get('/', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== TOKEN) {
        console.log("Request" , req.query.token)
        return res.sendStatus(401);
    }

    console.log("Request OK" , req.query.token)
    // return challenge
    return res.end(req.query.challenge);
});

app.post('/pay', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== TOKEN) {
        console.log("Request Error" , req.query.token)
        return res.sendStatus(401);
    }
    console.log("Request OK" , req.query.token)
    console.log("Pay data: ",req.body);
    const data = {
        response: {
            code: "OK",
            message: "Pay msg processed successfully"
        }
    };

    res.json(data);
});

app.post('/resguardo', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== TOKEN) {
        console.log("Request Error" , req.query.token)
        return res.sendStatus(401);
    }
    console.log("Request /resguardo OK" , req.query.token)
    console.log("Resguardo data: ",req.body);


    //createPdf();

   sendTemplate(
        'resguardo',
        'Resguardo',
        'zirconlegal@gmail.com',
        {
            first_name: 'Danieltest',
            last_name: 'Pereztest'
        },
    ).then(() => console.log("then")).catch((err) => {
        console.log("err", err);
    });

    const data = {
        response: {
            code: "OK",
            message: "Resguardo msg processed successfully"
        }
    };

    res.json(data);
});
