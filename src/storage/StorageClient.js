const Store = require('data-store');

class StorageClient {
    constructor (args) {
        this.store = new Store({ path: `${args.storagePath}/message.json` });
    }

    get(keyPath) {
        return this.store.get(keyPath);
    }

    set(keyPath, value) {
        this.store.set(keyPath, value);
    }

    del(keyPath) {
        this.store.del(keyPath)
    }
}


module.exports = StorageClient;
