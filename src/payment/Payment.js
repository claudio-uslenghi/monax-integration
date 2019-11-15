const StorageClient = require('../storage/StorageClient');
const Status = require('../storage/Status');
const PagoFacilClient = require('../pagoFacil/PagoFacilClient');
const MonaxClient = require('../monax/MonaxClient');
const storageClient = new StorageClient();
const logger = require('../logger');

class Payment {
    constructor() {
        this.pagoFacilClient = new PagoFacilClient();
        this.monaxClient = new MonaxClient();
    }

    async processReceived() {
        logger.info("Start to process messages received");

        //get DATA
        let arr = storageClient.getByStatus(Status.RECEIVE);
        logger.info(`List count=${arr.length}`);

        if (arr.length > 0) {
            let p = await this.pagoFacilClient.loginToken().then(() => {
                arr.forEach(data => {
                    logger.info(`DATA= ${JSON.stringify(data.msg)}`);
                    storageClient.set(data.msg.activity_instance_id, Status.FINISH, data.msg)
                    //TODO process each message
                })
            });
        }

        logger.info("End process messages received");
    }


    async processFinish() {
        logger.info(`Start to process messages with status ${Status.FINISH}`);
        let arr = storageClient.getByStatus(Status.FINISH);
        logger.info(`List count=${arr.length}`);

        if (arr.length > 0) {

            let s = await this.monaxClient.login().then(() => {
                arr.forEach(data => {
                    let id = data.msg.activity_instance_id;
                    logger.info(`id= ${id}`);
                    let p = this.monaxClient.getAndCompleteTask(id).then(() => {
                            logger.info(`fater call activity_instance_id= ${id}`);
                        }
                    ).catch(e => {
                        logger.error(`Error= ${e}`);
                    });
                });
            });
        }
        logger.info(`End process messages with status ${Status.FINISH}`);
    }

}

module.exports = Payment;
