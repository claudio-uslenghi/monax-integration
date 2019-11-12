'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates http server
const {TOKEN} = require('./config');
const {EMAIL_ACCOUNT, EMAIL_SECRET, EMAIL_FROM_ADDR} = require('./config');
const {sendTemplate} = require('./email/sendMail');
const {callPagoFacil} = require('./pagoFacil/index')
//const {getActivityInstances} = require('./monax/index')
const MonaxClient = require('./monax/MonaxClient')

var schedule = require('node-schedule');
const StorageClient = require('./storage/StorageClient');

const monaxClient = new MonaxClient({});

const storageClient = new StorageClient({
    storagePath: 'storage'
});

let j = schedule.scheduleJob('*/30 * * * * *', function () {
    console.log('This job was supposed to run at ' + ', but actually ran at ' + new Date());
});


app.listen(3000, () => console.log('Webhook is listening'));


/****************************************
 * GET  token
 ***************************************/
app.get('/', (req, res) => {
    if (req.query.token !== TOKEN) {
        console.log("Request", req.query.token)
        return res.sendStatus(401);
    }

    console.log("Request OK", req.query.token)
    // return challenge
    return res.end(req.query.challenge);
});


/****************************************
 * POST payment
 ***************************************/
app.post('/pay', async (req, res) => {
    if (req.query.token !== TOKEN) {
        console.log("1 Request Error", req.query.token)
        return res.sendStatus(401);
    }
    console.log("2 Request OK", req.query.token)
    console.log("3 Pay data: ", req.body);
    const body = req.body;
    const id = req.body.activity_instance_id;

    //Save data in cached
    if (id) {
        console.log("4 Save data in cache wit id: ", id);
        storageClient.set(id, body);//

    }

    // call monax
    console.log("5 before getActivityInstances");

    /*
    let task = await getActivityInstances(id)
        .then(response => {
            console.log('response', response);
        })
        .catch(error => {
            console.log(error);
        });
    */
    //let pago = await callPagoFacil(body, id);


    //  let result = getActivityInstances(id)
    //      .then(result => console.log("5.1 entro"))
    //      .catch(e => console.log('5.2 error', e));
    // call pago facil
    console.log("6 before callPagoFacil");
    //  callPagoFacil(body, id);
    console.log("7 after callPagoFacil");
    // wait response
    // callnack to PUT  https://develop.api.monax.io/tasks/<actinsID>/complete


    const data = {
        response: {
            code: "OK",
            message: "Pay msg processed successfully"
        }
    };

    res.json(data);
});

/****************************************
 * GET payment received
 ***************************************/
app.get('/pay', (req, res) => {
    console.log("1");
    const token = req.query.token;
    const id = req.query.activity_instance_id;
    console.log("2");

    if (token !== TOKEN) {
        console.log("Request Error", req.query.token)
        return res.sendStatus(401);
    }
    console.log("3");

    let response = {};
    if (id) {
        console.log("activity_instance_id = ", req.query.activity_instance_id)
        response = storageClient.get(id);//
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };

    res.json(data);
});

/****************************************************
 * PUT complete task in monax
 * use this endpoint to retry to complete the task
 ****************************************************/
app.put('/pay/task/complete', (req, res) => {
    const token = req.query.token;
    const id = req.query.activity_instance_id;
    let result = {};

    if (token !== TOKEN) {
        console.log("Request Error", req.query.token)
        return res.sendStatus(401);
    }
    let response = {};
    if (id) {
        console.log("1 Begin /pay/task/complete - activity_instance_id = ", id)
        monaxClient.getAndCompleteTask(id)
            .then(msg => {
                console.log(msg);
                console.log("2 End /pay/task/complete");
            })
            .catch(e => console.log(e));
        console.log("3 End /pay/task/complete");
    }
    const data = {
        response: {
            code: "OK",
            message: result
        }
    };

    res.json(data);
});

/****************************************************
 * POST resguardo
 * receive resguardo from monax send email the user
 ****************************************************/
app.post('/resguardo', (req, res) => {
    if (req.query.token !== TOKEN) {
        console.log("Request Error", req.query.token)
        return res.sendStatus(401);
    }
    console.log("Request /resguardo OK", req.query.token)
    console.log("Resguardo data: ", req.body);


    sendTemplate(
        'resguardo',
        'Resguardo',
        EMAIL_FROM_ADDR,
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


/****************************************
 * POST send pay to pago faciltoken
 ***************************************/
app.post('/pay/send', (req, res) => {
    if (req.query.token !== TOKEN) {
        console.log("Request", req.query.token)
        return res.sendStatus(401);
    }
    const id = req.body.activity_instance_id;
    console.log("id: ", id);
    const pay = storageClient.get(id);
    console.log("payment: ", pay);
    const msg = pay ? "Payment send to Pago Facil" : "Id not found, payment is not sent to Pago Faci";
    const code = pay ? "OK" : "ERROR";

    const data = {
        response: {
            code: code,
            message: msg
        }
    };
    res.json(data);
});




