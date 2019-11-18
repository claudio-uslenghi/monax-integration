'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json()); // creates http server
const {TOKEN} = require('./config');
const {EMAIL_ACCOUNT, EMAIL_SECRET, EMAIL_FROM_ADDR} = require('./config');
const {sendTemplate} = require('./email/sendMail');
const {callPagoFacil} = require('./pagoFacil/index')
const MonaxClient = require('./monax/MonaxClient')
var schedule = require('node-schedule');
const StorageClient = require('./storage/StorageClient');
const Status = require('./storage/Status');
const Payment = require('./payment/Payment');
const logger = require('./logger');

const monaxClient = new MonaxClient({});
const storageClient = new StorageClient();
const payment = new Payment();


let processMessageReceived = schedule.scheduleJob('*/60 * * * * *', async function () {
    logger.info('========================START job run each 60 seconds PROCESS RECEIVED MSG============================');
    let p = await payment.processReceived();
    logger.info('========================FINISH job run each 60 seconds================================================');
});

let processMessageFinish = schedule.scheduleJob('*/120 * * * * *', async function () {
    logger.info('========================START job run each 120 seconds PROCESS FINISH MSG===============================');
    let p = payment.processFinish();
    logger.info('========================FINISH job run each 120 seconds=================================================');
});



app.listen(3000, () => console.log('Webhook is listening'));


/****************************************
 * GET  token
 ***************************************/
app.get('/', (req, res) => {
    if (req.query.token !== TOKEN) {
        logger.info("Request", req.query.token)
        return res.sendStatus(401);
    }
    logger.info("Request OK", req.query.token)
    // return challenge
    return res.end(req.query.challenge);
});


/****************************************
 * POST payment
 ***************************************/
app.post('/pay', async (req, res) => {
    if (req.query.token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }
    logger.info(`2 Request OK ${req.query.token}`)
    logger.info("3 Pay data: ", req.body);
    const body = req.body;
    const id = req.body.activity_instance_id;



    //Save data in cached
    if (id && body) {
        logger.info(`4 Save data in cache wit id: ${id}`);
        storageClient.set(id, Status.RECEIVE, body);//
    } else {
        logger.error(`id or body empty id=${id} body=${body}`);
        return res.sendStatus(401);
    }

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
    //logger.info("1");
    const token = req.query.token;
    const id = req.query.activity_instance_id;
    //logger.info("2");

    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }
    //logger.info("3");

    let response = {};
    if (id) {
        //logger.info("activity_instance_id = ", req.query.activity_instance_id)
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
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }
    let response = {};
    if (id) {
        //logger.info("1 Begin /pay/task/complete - activity_instance_id = ", id)
        monaxClient.getAndCompleteTask(id)
            .then(msg => {
                //logger.info(msg);
                logger.info("2 End /pay/task/complete");
            })
            .catch(e => console.error(e));
        //logger.info("3 End /pay/task/complete");
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
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }
    //logger.info("Request /resguardo OK", req.query.token)
    //logger.info("Resguardo data: ", req.body);


    sendTemplate(
        'resguardo',
        'Resguardo',
        EMAIL_FROM_ADDR,
        {
            first_name: 'Danieltest',
            last_name: 'Pereztest'
        },
    ).then(() => console.log("then")).catch((err) => {
        console.error("err", err);
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
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }
    const id = req.body.activity_instance_id;
    //logger.info("id: ", id);
    const pay = storageClient.get(id);
    //logger.info("payment: ", pay);
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

/************************************************************************************************
 * MANAGE MESSAGES
 ************************************************************************************************/

/****************************************
 * GET Message by ID
 ***************************************/
app.get('/message/:activity_instance_id', (req, res) => {
    const token = req.query.token;
    const id = req.params.activity_instance_id;
    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }

    let response = {};
    if (id) {
        logger.info(`activity_instance_id = ${id}`)
        response = storageClient.get(id);
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };
    res.json(data);
});

/****************************************
 * GET Message list  by STATUS
 ***************************************/
app.get('/message/status/:statusId', (req, res) => {
    const token = req.query.token;
    const status = req.params.statusId;
    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }
    let response = {};
    if (status) {
        logger.info(`status = ${status}`);
        response = storageClient.getByStatus(status);
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };
    res.json(data);
});

/****************************************
 * POST Message Manually
 ***************************************/
app.post('/message', (req, res) => {
    const token = req.query.token;
    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }
    const json = req.body
    let response = {};
    if (json) {
        response = storageClient.set(json.msg.activity_instance_id, json.status, json.msg);
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };
    res.json(data);
});


/****************************************
 * DELETE Message by ID
 ***************************************/
app.delete('/message/:activity_instance_id', (req, res) => {
    const token = req.query.token;
    const id = req.params.activity_instance_id;
    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }

    let response = {};
    if (id) {
        logger.info(`activity_instance_id = ${id}`)
        response = storageClient.del(id);
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };
    res.json(data);
});



/************************************************************************************************
 * PAGO FACIL CALLBACK
 ************************************************************************************************/

/****************************************
 * GET /pagofacil/callback
 ***************************************/
app.get('/pagofacil/callback', (req, res) => {
    logger.info(`/pagofacil/callback received`)
    const token = req.query.token;
    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }

    let response = {};
    if (req.body) {
        logger.info(`/pagofacil/callback body  = ${req.body}`)
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };
    res.json(data);
});

/****************************************
 * GET /pagofacil/callback
 ***************************************/
app.get('/pagofacil/cancel', (req, res) => {
    logger.info(`/pagofacil/cancel received`)
    const token = req.query.token;
    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }

    let response = {};
    if (req.body) {
        logger.info(`/pagofacil/cancel body  = ${req.body}`)
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };
    res.json(data);
});

/****************************************
 * GET /pagofacil/complete
 ***************************************/
app.get('/pagofacil/complete', (req, res) => {
    logger.info(`/pagofacil/complete received`)
    const token = req.query.token;
    if (token !== TOKEN) {
        logger.error(`Token Invalid ${req.query.token}`);
        return res.sendStatus(401);
    }

    let response = {};
    if (req.body) {
        logger.info(`/pagofacil/complete body  = ${req.body}`)
    }
    const data = {
        response: {
            code: "OK",
            message: response
        }
    };
    res.json(data);
});






