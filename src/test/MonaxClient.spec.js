const { assert, expect } = require('chai');
const _ = require('lodash');
const MonaxClient = require('../monax/MonaxClient');
// const config              = require('../etc/config.json');

const monaxClient = new MonaxClient({});

const id = 'C3BBCA8CCFEC938788AC0ABBAB08E94EF736A4893B38F648C32ECB332B3B1C98';
/*
describe('Monax Client Test', async () => {


    it('should login in monax', async () => {
        const result = await monaxClient.login();
        expect(result.username).to.equal('integration_user');
        console.log(result);
    })


    it('should get air quality data', async () => {
        //console.log("1");
        //const result = await monaxClient.login();
       // console.log("2");
        //expect(result.username).to.equal('integration_user');
       // console.log("3");
        //console.log(result);

        let data = await monaxClient.getActivityInstances(id);
        console.log("4");
        assert.equal(data, null);
        done();
        console.log("5");
    })

});
*/
