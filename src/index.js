'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates http server
const token = 'VERIFICATION_TOKEN'; // type here your verification token

app.listen(3000, () => console.log('Webhook is listening'));


app.get('/', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== token) {
        console.log("Request" , req.query.token)
        return res.sendStatus(401);
    }

    console.log("Request OK" , req.query.token)
    // return challenge
    return res.end(req.query.challenge);
});

app.post('/pay', (req, res) => {
    // check if verification token is correct
    if (req.query.token !== token) {
        console.log("Request Error" , req.query.token)
        return res.sendStatus(401);
    }

    console.log("Request OK" , req.query.token)

    // print request body
    console.log(req.body);

    // return a text response
    const data = {
        response: {
            code: "OK",
            message: "Message processed successfully"
        }
    };

    res.json(data);
});



