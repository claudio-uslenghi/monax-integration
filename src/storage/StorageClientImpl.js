const Store = require('data-store');
const logger = require('../logger')


class StorageClientImpl {
    constructor(args) {
        this.store = new Store({path: `${args.storagePath}/messages.json`});
    }

    get(keyPath) {
        return this.store.get(keyPath);
    }

    set(keyPath, status, value) {
        const msg = {status: status, msg: value};
        logger.info(`Msg to persist ${msg}`);
        this.store.set(keyPath, msg);
    }

    del(keyPath) {
        this.store.del(keyPath)
    }

    getByStatus(status) {
        let result = [];
        let p = JSON.parse(this.store.json());
        for (var key in p) {
            logger.info(`has key ${key} -> ${JSON.stringify(p[key])}`);
            if (p[key].status === status) {
                result.push(p[key]);
            }
        }
        return result;
    }

}


module.exports = StorageClientImpl;
