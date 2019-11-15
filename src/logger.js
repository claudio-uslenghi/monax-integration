const {LOG_LEVEL} = require('./config');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} -- ${level}: ${message}`;
});



const logger = new createLogger({
    level: LOG_LEVEL,
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console({
            timestamp: true
        }),
        new transports.File({
            filename: 'server.log',
            handleExceptions: true,
            maxsize: 5242880, // 5MB
            maxFiles: 30,
        }),
        new transports.File({
            filename: 'error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 30,
        }),
    ],
});

module.exports = logger;
