'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates http server
const token = 'VERIFICATION_TOKEN'; // type here your verification token

app.listen(3000, () => console.log('[ChatBot] Webhook is listening'));


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
        return res.sendStatus(401);
    }

    // print request body
    console.log(req.body);

    // return a text response
    const data = {
        responses: [
            {
                type: 'text',
                elements: ['Here need to process message payment message']
            }
        ]
    };

    res.json(data);
});



