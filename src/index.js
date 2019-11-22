const express = require('express');
const bodyParser = require('body-parser');

const app = express().use(bodyParser.json()); // creates http server
const schedule = require('node-schedule');
const {TOKEN} = require('./config');
const {EMAIL_FROM_ADDR} = require('./config');
const {sendTemplate} = require('./email/sendMail');
const MonaxClient = require('./monax/MonaxClient');
const StorageClient = require('./storage/StorageClient');
const Status = require('./storage/Status');
const Payment = require('./payment/Payment');
const logger = require('./logger');

const monaxClient = new MonaxClient({});
const storageClient = new StorageClient();
const payment = new Payment();

const CODE_NO_ERROR = 'OK';
const MSG_RECEIVED = 'Message received successfully';


schedule.scheduleJob('*/1 * * * *', async () => {
  logger.info('========================START job run each 60 seconds PROCESS RECEIVED MSG============================');
  await payment.processReceived();
  logger.info('========================FINISH job run each 60 seconds================================================');
});

schedule.scheduleJob('*/2 * * * *', async () => {
  logger.info('========================START job run each 120 seconds PROCESS FINISH MSG===============================');
  payment.processFinish();
  logger.info('========================FINISH job run each 120 seconds=================================================');
});


app.listen(3000, () => logger.info('Webhook is listening'));


/** **************************************
 * GET  token
 ************************************** */
app.get('/', (req, res) => {
  if (req.query.token !== TOKEN) {
    logger.info('Request', req.query.token);
    return res.sendStatus(401);
  }
  logger.info('Request OK', req.query.token);
  // return challenge
  return res.end(req.query.challenge);
});


/** **************************************
 * POST payment
 ************************************** */
app.post('/pay', (req, res) => {
  if (req.query.token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }
  logger.info(`2 Request OK ${req.query.token}`);
  logger.info(`3 Pay data: ${JSON.stringify(req.body)}`);

  const body = req.body.activityDetails;
  const id = req.body.activityDetails.activity_instance_id;

  // Save data in cached
  if (id && body) {
    if (storageClient.get(id)) {
      logger.error(`The message with id=${id} already exists.`);
    } else {
      logger.info(`4 Save data in cache with id: ${id}`);
      storageClient.set(id, Status.RECEIVE, body);
    }
  } else {
    logger.error(`id or body empty id=${id} body=${body}`);
    return res.sendStatus(401);
  }

  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: 'Pay msg processed successfully',
    },
  };

  res.json(data);
});

/** **************************************
 * GET payment received
 ************************************** */
app.get('/pay', (req, res) => {
  const {token} = req.query;
  const id = req.query.activity_instance_id;

  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }

  let response = {};
  if (id) {
    response = storageClient.get(id);
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: response,
    },
  };

  return res.json(data);
});

/** **************************************************
 * PUT complete task in monax
 * use this endpoint to retry to complete the task
 *************************************************** */
app.put('/pay/task/complete', (req, res) => {
  const {token} = req.query;
  const id = req.query.activity_instance_id;
  const result = {};

  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }
  if (id) {
    monaxClient.getAndCompleteTask(id)
      .then(() => {
        logger.info('2 End /pay/task/complete');
      })
      .catch((e) => console.error(e));
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: result,
    },
  };

  res.json(data);
});

/** **************************************************
 * POST resguardo
 * receive resguardo from monax send email the user
 *************************************************** */
app.post('/resguardo', (req, res) => {
  if (req.query.token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }


  sendTemplate(
    'resguardo',
    'Resguardo',
    EMAIL_FROM_ADDR,
    {
      first_name: 'Danieltest',
      last_name: 'Pereztest',
    },
  ).then(() => console.log('then')).catch((err) => {
    logger.error(`err ${err}`);
  });

  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: 'Resguardo msg processed successfully',
    },
  };

  res.json(data);
});


/** **************************************
 * POST send pay to pago faciltoken
 ************************************** */
app.post('/pay/send', (req, res) => {
  if (req.query.token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }
  const id = req.body.activity_instance_id;
  // logger.info("id: ", id);
  const pay = storageClient.get(id);
  // logger.info("payment: ", pay);
  const msg = pay ? 'Payment send to Pago Facil' : 'Id not found, payment is not sent to Pago Faci';
  const code = pay ? CODE_NO_ERROR : 'ERROR';

  const data = {
    response: {
      code,
      message: msg,
    },
  };
  res.json(data);
});

/** **********************************************************************************************
 * MANAGE MESSAGES
 *********************************************************************************************** */

/** **************************************
 * GET Message by ID
 ************************************** */
app.get('/message/:activity_instance_id', (req, res) => {
  const {token} = req.query;
  const id = req.params.activity_instance_id;
  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }

  let response = {};
  if (id) {
    logger.info(`activity_instance_id = ${id}`);
    response = storageClient.get(id);
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: response,
    },
  };
  return res.json(data);
});

/** **************************************
 * GET Message list  by STATUS
 ************************************** */
app.get('/message/status/:statusId', (req, res) => {
  const {token} = req.query;
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
      code: CODE_NO_ERROR,
      message: response,
    },
  };
  return res.json(data);
});

/** **************************************
 * POST Message Manually
 ************************************** */
app.post('/message', (req, res) => {
  const {token} = req.query;
  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }
  const json = req.body;
  let response = {};
  if (json) {
    response = storageClient.set(json.msg.activity_instance_id, json.status, json.msg);
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: response,
    },
  };
  res.json(data);
});


/** **************************************
 * DELETE Message by ID
 ************************************** */
app.delete('/message/:activity_instance_id', (req, res) => {
  const {token} = req.query;
  const id = req.params.activity_instance_id;
  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }

  let response = {};
  if (id) {
    logger.info(`activity_instance_id = ${id}`);
    response = storageClient.del(id);
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: response,
    },
  };
  return res.json(data);
});


/** **********************************************************************************************
 * PAGO FACIL CALLBACK
 *********************************************************************************************** */

/** **************************************
 * POST /pay/pagofacil/callback
 ************************************** */
app.post('/pay/pagofacil/callback', (req, res) => {
  logger.info('/pay/pagofacil/callback received');
  const {token} = req.query;
  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }

  if (req.body) {
    logger.info(`/pay/pagofacil/callback body  = ${JSON.stringify(req.body)}`);
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: MSG_RECEIVED,
    },
  };
  res.json(data);
});

/** **************************************
 * GET  /pay/pagofacil/cancel
 ************************************** */
app.get('/pay/pagofacil/cancel', (req, res) => {
  logger.info('/pay/pagofacil/cancel received');
  const {token} = req.query;
  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }

  if (req.body) {
    logger.info(`/pay/pagofacil/cancel body  = ${JSON.stringify(req.body)}`);
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: MSG_RECEIVED,
    },
  };
  res.json(data);
});

/** **************************************
 * POST  /pay/pagofacil/complete
 ************************************** */
app.post('/pay/pagofacil/complete', (req, res) => {
  logger.info('/pay/pagofacil/complete received');
  const {token} = req.query;
  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }

  if (req.body) {
    logger.info(`/pay/pagofacil/complete body  = ${JSON.stringify(req.body)}`);
  }
  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: MSG_RECEIVED,
    },
  };
  res.json(data);
});


/** **************************************
 * POST /pay/pagofacil/tef/callback
 ************************************** */
app.post('/pay/pagofacil/tef/callback', (req, res) => {
  logger.info('POST /pay/pagofacil/tef/callback received');
  const {token} = req.query;
  if (token !== TOKEN) {
    logger.error(`Token Invalid ${req.query.token}`);
    return res.sendStatus(401);
  }

  if (req.body) {
    logger.info(`POST /pay/pagofacil/tef/callback body  = ${JSON.stringify(req.body)}`);

    const {status} = req.body.tefResponse;
    const {id} = req.body.tefResponse.tef;

    logger.info(`id ${id} status ${status}`);

    const msg2Update = storageClient.get(id);
    logger.info(`MSG ${JSON.stringify(msg2Update)}`);
    storageClient.set(id, Status.FINISH, msg2Update.msg);
  }


  const data = {
    response: {
      code: CODE_NO_ERROR,
      message: MSG_RECEIVED,
    },
  };
  res.json(data);
});
