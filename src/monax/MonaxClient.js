const rp = require('request-promise-native');
const _ = require('lodash');
const {
  MONAX_TOKEN, MONAX_BASE_URL, MONAX_USER, MONAX_PASS,
} = require('./../config');
const logger = require('../logger');

class MonaxClient {
  constructor() {
    this.options = {
      headers:
        {
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          cookie: MONAX_TOKEN,
        },
      baseUrl: MONAX_BASE_URL,
      uri: '',
      timeout: 10000,
      method: 'GET',
      gzip: true,
      resolveWithFullResponse: true,
    };
    this.getActivityInstances = this.getActivityInstances.bind(this);
    this.login = this.login.bind(this);
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
          throw new Error(`Application error returned from Monax. Error: ${JSON.stringify(message.body)}`);
      } else {
        result = message.body;
      }
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }


  async login() {
    const uri = '/users/login/';
    const options = 'PUT';

    const requestSchema = {
      username: MONAX_USER,
      password: MONAX_PASS,
    };

    const result = await this.send(uri, options, requestSchema);
    return result;
  }

  async getActivityInstances(id) {
    const uri = `/bpm/activity-instances/${id}/data-mappings/`;
    const requestSchema = {};
    const options = 'GET';
    const result = await this.send(uri, options, requestSchema);
    logger.info(`getActivityInstances result= ${result}`);
    return result;
  }

  async completeTask(id) {
    const uri = `/tasks/${id}/complete/`;
    const requestSchema = {};
    const options = 'PUT';
    const result = await this.send(uri, options, requestSchema);
    logger.info(`completeTask result= ${result}`);
    return result;
  }


  async getAndCompleteTask(id) {
    logger.info('1.0 getAndCompleteTask');
    await this.getActivityInstances(id);
    logger.info('1.1 getAndCompleteTask');
    const result = await this.completeTask(id);
    logger.info('1.2 getAndCompleteTask');
    return result;
  }
}

module.exports = MonaxClient;
