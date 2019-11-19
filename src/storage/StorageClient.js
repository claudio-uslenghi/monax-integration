const StorageClientImpl = require('./StorageClientImpl');

class StorageClient {
  constructor() {
    this.storageClient = new StorageClientImpl({
      storagePath: 'storage',
    });
  }

  get(keyPath) {
    return this.storageClient.get(keyPath);
  }

  set(keyPath, status, value) {
    this.storageClient.set(keyPath, status, value);
  }

  del(keyPath) {
    this.storageClient.del(keyPath);
  }

  getByStatus(status) {
    return this.storageClient.getByStatus(status);
  }
}

module.exports = StorageClient;
