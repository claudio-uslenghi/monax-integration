const rp = require('request-promise-native');
const _ = require('lodash');
const request = require("request");

class MonaxClientReq {
    constructor(args) {

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
        const options = {
            method: 'PUT',
            url: 'https://develop.api.monax.io/users/login/',
            headers:
                {
                    'postman-token': '546f418d-3bc5-c81c-e608-6e1dbf9264bd',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
            body: {username: 'integration_user', password: 'password'},
            json: true,
            timeout: 5000
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });

    }

    async getActivityInstances() {
        const options = {
            method: 'GET',
            url: 'https://develop.api.monax.io/bpm/activity-instances/C3BBCA8CCFEC938788AC0ABBAB08E94EF736A4893B38F648C32ECB332B3B1C98/data-mappings',
            headers:
                {
                    'postman-token': 'b9279878-cd48-587b-a6a0-7e3962398482',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json'
                },
            body: {username: 'cuslenghi@zircon.tech', password: 'Rampla123'},
            json: true,
            timeout: 5000
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });
    }


}

module.exports = MonaxClientReq;
