const Store = require('data-store');
const logger = require('../logger');


class StorageClientImpl {
  constructor(args) {
    this.store = new Store({ path: `${args.storagePath}/messages.json` });
  }

  get(keyPath) {
    return this.store.get(keyPath);
  }

  set(keyPath, status, value) {
    const msg = { status, msg: value };
    logger.info(`Msg to persist= ${JSON.stringify(msg)}`);
    this.store.set(keyPath, msg);
  }

  del(keyPath) {
    this.store.del(keyPath);
  }

  getByStatus(status) {
    const result = [];
    const p = JSON.parse(this.store.json());
    for (const key in p) {
      logger.info(`Has key=${key} ->  with status=${JSON.stringify(p[key].status)}`);
      if (p[key].status === status) {
        result.push(p[key]);
      }
    }
    return result;
  }
}


module.exports = StorageClientImpl;
