const rp = require('request-promise-native');
const _ = require('lodash');
const { TOKEN, PAGO_FACIL_TOKEN, PAGO_FACIL_BASE_URL } = require('./../config');


class PagoFacilClient {
  constructor(args) {
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

  async _send(uri, options, requestSchema) {
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
    const result = await this._send(uri, options, requestSchema);
    console.log(`Pago Facil JWT token ${result}`);
    return result;
  }
}

module.exports = PagoFacilClient;
