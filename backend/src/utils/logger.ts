import pino, { type LoggerOptions } from "pino";
import { IS_PROD } from "../config/env.js";

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (IS_PROD ? "info" : "debug"),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(!IS_PROD && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  }),
};

export const logger = pino(options);

export default logger;
