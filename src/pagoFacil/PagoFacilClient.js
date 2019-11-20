const rp = require('request-promise-native');
const _ = require('lodash');
const { PAGO_FACIL_TOKEN, PAGO_FACIL_BASE_URL, PAGO_FACIL_ACCOUNT_ID, PAGO_FACIL_USER } = require('./../config');
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

  async send(uri, options, requestSchema) {
    try {
      if (options) {
        this.options.method = options;
      }

      const message = await rp({
        ...this.options,
        uri,
        body: requestSchema,
        json: true,
      });
      let result = null;

      if (message.statusCode !== 200) {
        throw new Error('Did not receive a 200 status code from Monax');
      } else if (_.has(message.body, 'error') && message.body.error !== null) {
        if (message.body.error.code === 20 || message.body.error.code === 21) {
          throw new Error('Location not supported by Monax');
        } else {
          throw new Error(`Application error returned from Monax. Error: ${message.body}`);
        }
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
    logger.info(`Pago Facil JWT token ${result}`);
    return result;
  }


  async createTrxs(id, amount) {
    const uri = 'trxs/create';
    const options = 'POST';
    const requestSchema = {
      "x_url_callback" : "http://ec2-52-67-244-183.sa-east-1.compute.amazonaws.com:3000/pay/pagofacil/callback?token=VERIFICATION_TOKEN",
      "x_url_cancel":"http://ec2-52-67-244-183.sa-east-1.compute.amazonaws.com:3000/pay/pagofacil/cancel?token=VERIFICATION_TOKEN",
      "x_url_complete":"http://ec2-52-67-244-183.sa-east-1.compute.amazonaws.com:3000/pay/pagofacil/complete?token=VERIFICATION_TOKEN",
      "x_customer_email":PAGO_FACIL_USER,
      "x_reference":id,
      "x_account_id":PAGO_FACIL_ACCOUNT_ID,
      "x_amount": amount
    };
    const result = await this.send(uri, options, requestSchema);
    logger.info(`Pago Facil JWT token ${result}`);
    return result;
  }

}

module.exports = PagoFacilClient;
