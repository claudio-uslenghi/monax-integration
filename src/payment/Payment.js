const StorageClient = require('../storage/StorageClient');
const Status = require('../storage/Status');
const PagoFacilClient = require('../pagoFacil/PagoFacilClient');
const MonaxClient = require('../monax/MonaxClient');

const logger = require('../logger');

class Payment {
  constructor() {
    this.pagoFacilClient = new PagoFacilClient();
    this.monaxClient = new MonaxClient();
    this.storageClient = new StorageClient();
  }

  async executePagoFacil(id, amount, createToken) {
    logger.info('1.0 createTrxs');
    const result1 = await this.pagoFacilClient.createTrxs(id, amount, createToken);
    logger.info('1.1 tefLoginToken');
    const tefToken = await this.pagoFacilClient.tefLoginToken();
    logger.info('1.2 tefTx');
    const result2 = await this.pagoFacilClient.tefTx(id, amount, tefToken);
    return result2;
  }

  async processReceived() {
    logger.info('Start to process messages received');

    try {
      const arr = this.storageClient.getByStatus(Status.RECEIVE);
      logger.info(`List count=${arr.length}`);

      if (arr.length > 0) {
        logger.info('0.9 loginToken');
        await this.pagoFacilClient.loginToken().then((createToken) => {
          arr.forEach((data) => {
            logger.info(`DATA= ${JSON.stringify(data.msg)}`);

            // TODO obtain amounts
            this.executePagoFacil(data.msg.activity_instance_id, 5001, createToken).then(() => {
              logger.info('2.0 storageClient.set');

              this.storageClient.set(data.msg.activity_instance_id, Status.IN_PROGRESS, data.msg);
            });
          });
        });
      }
    } catch (err) {
      logger.error(`${err}`);
      // throw new Error(err);
    }
    logger.info('End process messages received');
  }


  async processFinish() {
    logger.info(`Start to process messages with status ${Status.FINISH}`);
    const arr = this.storageClient.getByStatus(Status.FINISH);
    logger.info(`List count=${arr.length}`);

    if (arr.length > 0) {
      await this.monaxClient.login().then(() => {
        arr.forEach((data) => {
          const id = data.msg.activity_instance_id;
          logger.info(`id= ${id}`);
          this.monaxClient.getAndCompleteTask(id).then(() => {
            logger.info(`fater call activity_instance_id= ${id}`);
          }).catch((e) => {
            logger.error(`Error= ${e}`);
          });
        });
      });
    }
    logger.info(`End process messages with status ${Status.FINISH}`);
  }
}

module.exports = Payment;
