// const assert = require('assert');
const mocha = require('mocha');
const StorageClient = require('../storage/StorageClient');
const Status = require('../storage/Status');

const { describe } = mocha;
const { it } = mocha;
const { assert } = require('chai');


const storageClient = new StorageClient();


const activity_instance_id = '123456';
const value = {
  activity_instance_id: '123456',
  activity_id: 'Task_0zku3q4',
  activity_name: 'Pago de servicio',
  created: '1572233813',
  completed: '0',
  performer: '3343',
  agreement_name: 'Contrato Pintor Alejandro Martinez',

};

const activity_instance_id2 = '56789';
const value2 = {
  activity_instance_id: '56789',
  activity_id: 'Task_0zku3q4',
  activity_name: 'Pago de servicio',
  created: '1572233813',
  completed: '0',
  performer: '3343',
  agreement_name: 'Contrato Pintor Alejandro Martinez',

};

describe('Geocoder Client Test', async () => {
  it('set', async () => {
    const res = storageClient.set(activity_instance_id, Status.RECEIVE, value);
    assert.equal(res, null);
  });

  it('get', async () => {
    const stored = storageClient.get(activity_instance_id);
    console.log(stored);
    assert.equal(stored.msg.activity_instance_id, activity_instance_id);
    assert.equal(stored.status, Status.RECEIVE);
  });


  it('set', async () => {
    const res = storageClient.set(activity_instance_id2, Status.RECEIVE, value2);
    const res2 = storageClient.set('test', Status.COMPLETE, value2);
    let arr = [];
    arr = storageClient.getByStatus(Status.RECEIVE);
    assert.equal(arr.length, 2);
  });
});
