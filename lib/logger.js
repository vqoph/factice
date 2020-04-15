const chalk = require('chalk');
const dayjs = require('dayjs');
const { createLogger, format, transports } = require('winston');
const MESSAGE = Symbol.for('message');

function consoleFormater(logEntry) {
  const { level, message, scope, raw, stack } = JSON.parse(logEntry[MESSAGE]);
  const timestamp = dayjs().format('HH:mm:ss.SSS');

  if (raw) {
    logEntry[MESSAGE] = message;
    return logEntry;
  }

  const prefix = level + (scope ? ` [${scope}]: ` : '').padEnd(12);
  const mColor = (level === 'error' && 'redBright') || 'white';
  const pColor =
    {
      alert: 'cyan',
      error: 'redBright',
      warning: 'yellow',
      notice: 'gray',
      info: 'cyan',
      debug: 'purple',
    }[level] || 'gray';

  let cleanedStack = '';
  if (stack)
    cleanedStack =
      '\n' + stack.split('\n').splice(1).join('\n').replace(/    /gi, '');

  const formattedMessage = chalk`{${pColor} ${prefix}}{${mColor} ${message}} {gray (${timestamp})} {gray ${cleanedStack}}`;
  logEntry[MESSAGE] = formattedMessage;

  return logEntry;
}

const logger = createLogger({
  transports: [
    new transports.Console({
      format: format(consoleFormater)(),
    }),
  ],
});

module.exports = logger;
