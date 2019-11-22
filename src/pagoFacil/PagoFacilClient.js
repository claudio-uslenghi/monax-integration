const rp = require('request-promise-native');
const _ = require('lodash');
const {
  PAGO_FACIL_TOKEN, PAGO_FACIL_USER, PAGO_FACIL_BASE_URL, PAGO_FACIL_ACCOUNT_ID, ZIRCON_BASE_URL,
  ZIRCON_CALLBACK_URL, ZIRCON_CANCEL_URL, ZIRCON_COMPLETE_URL, PAGO_FACIL_TEF_BASE_URL
} = require('./../config');
const logger = require('../logger');

class PagoFacilClient {
  constructor() {
    this.options = {
      headers:
        {
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          authorization: `Bearer ${PAGO_FACIL_TOKEN}`,
        },
      baseUrl: PAGO_FACIL_BASE_URL,
      uri: '',
      timeout: 10000,
      method: 'POST',
      gzip: true,
      resolveWithFullResponse: true,
    };
    this.loginToken = this.loginToken.bind(this);
  }

  async send(uri, options, requestSchema, headers, baseUrl) {
    try {
      if (options) {
        this.options.method = options;
      }

      if (headers) {
        this.options.headers = headers;
      }
      if (baseUrl) {
        this.options.baseUrl = baseUrl;
      }


      logger.info(`OPTIONS ${JSON.stringify(this.options)}`);

      const message = await rp({
        ...this.options,
        uri,
        body: requestSchema,
        json: true,
      });
      let result = null;

      if (message.statusCode !== 200 && message.statusCode !== 201) {
        throw new Error('Did not receive a 200 status code from Monax');
      } else if (_.has(message.body, 'error') && message.body.error !== null) {
        throw new Error(`Application error returned from Pago Facil. Error: ${JSON.stringify(message.body)}`);
      } else {
        result = message.body;
      }
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async loginToken() {
    const uri = 'loginToken';
    const options = 'POST';
    const requestSchema = {};
    const result = await this.send(uri, options, requestSchema);
    logger.info(`Pago Facil loginToken result= ${JSON.stringify(result)}`);
    logger.info(`Pago Facil access_token_jwt= ${result.access_token_jwt}`);
    return result.access_token_jwt;
  }


  async createTrxs(id, amount, loginToken) {
    const uri = 'trxs/create';

    const headers = {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: `Bearer ${loginToken}`,
    };

    const options = 'POST';
    const requestSchema = {
      x_url_callback: `${ZIRCON_BASE_URL}${ZIRCON_CALLBACK_URL}`,
      x_url_cancel: `${ZIRCON_BASE_URL}${ZIRCON_CANCEL_URL}`,
      x_url_complete: `${ZIRCON_BASE_URL}${ZIRCON_COMPLETE_URL}`,
      x_customer_email: PAGO_FACIL_USER,
      x_reference: id,
      x_account_id: PAGO_FACIL_ACCOUNT_ID,
      x_amount: amount,
    };
    const result = await this.send(uri, options, requestSchema, headers);
    logger.info(`Pago Facil createTrxs result= ${result}`);
    return result;
  }


  async tefLoginToken() {
    const uri = 'loginToken';
    const options = 'POST';
    const requestSchema = {email: PAGO_FACIL_USER, apiToken: PAGO_FACIL_TOKEN};
    const baseUrl = PAGO_FACIL_TEF_BASE_URL;
    const result = await this.send(uri, options, requestSchema, {}, baseUrl);
    logger.info(`Pago Facil TEF loginToken result= ${JSON.stringify(result)}`);
    logger.info(`Pago Facil TEF access_token_jwt= ${result.access_token_jwt}`);
    return result.access_token_jwt;
  }


  async tefTx(id, amount, loginToken) {
    const uri = 'tef';
    const headers = {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: `Bearer ${loginToken}`,
    };
    const options = 'POST';
    const requestSchema = {
      tef: {
        id,
        messageToAddressee: 'Prueba transferencia 2',
        amount,
        recipientData: {
          rut: '11.111.111-1',
          name: 'Claudio Test 123',
          email: 'claudio.test123+recibe@gmail.com',
        },
        bankData: {
          bankSBIFNumber: '001',
          bankAccount: '123456789101121',
        },
      },
      callbackUrl: `${PAGO_FACIL_TEF_BASE_URL}pay/pagofacil/tef/callback?token=VERIFICATION_TOKEN`,
    };

    const result = await this.send(uri, options, requestSchema, headers);
    logger.info(`Pago Facil tef result= ${JSON.stringify(result)}`);
    return result;
  }
}

module.exports = PagoFacilClient;
