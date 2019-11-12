const rp = require('request-promise-native');
const _ = require('lodash');
const {TOKEN, MONAX_TOKEN, MONAX_BASE_URL} = require('./../config');


class MonaxClient {
    constructor(args) {
        this.options = {
            headers:
                {
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'cookie': MONAX_TOKEN
                },
            baseUrl: MONAX_BASE_URL,
            uri: '',
            timeout: 10000,
            method: 'GET',
            gzip: true,
            resolveWithFullResponse: true
        };
        this.getActivityInstances = this.getActivityInstances.bind(this);
        this.login = this.login.bind(this);

    }

    async _send(uri, options, requestSchema) {
        try {

            if (options) {
                this.options.method = options;
            }

            let message = await rp({
                ...this.options,
                uri,
                body: requestSchema,
                json: true
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



    async login() {
        const uri = '/users/login/';
        const options = 'PUT';

        let requestSchema = {
            "username": "integration_user",
            "password": "password"
        };

        let result = await this._send(uri, options, requestSchema);
        return result;
    }

    async getActivityInstances(id) {
        const uri = `/bpm/activity-instances/${id}/data-mappings/`;
        let requestSchema = {}
        const options = 'GET';
        let result =  await this._send(uri, options, requestSchema);
        console.log("getActivityInstances result=", result);
        return result;
    }

    async completeTask(id) {
        const uri = `/tasks/${id}/complete/`;
        let requestSchema = {}
        const options = 'PUT';
        let result =  await this._send(uri, options, requestSchema);
        console.log("complteTask result=", result);
        return result;
    }



    async getAndCompleteTask(id) {
        console.log("1.0 getAndCompleteTask");
        let res = await this.getActivityInstances(id);
        console.log("1.1 getAndCompleteTask");
        let result = await this.completeTask(id);
        console.log("1.2 getAndCompleteTask");
        return result;
    }
}

module.exports = MonaxClient;
