import pino, { Logger } from "pino";
import { ILogger } from "@/domain/services/logger.service";

// Module-level singleton: ES module cache đảm bảo file này chỉ chạy 1 lần,
// nên `logger` là cùng 1 instance ở mọi nơi import. Không cần class
// `getInstance()` kiểu GoF — đó là pattern dành cho ngôn ngữ không có
// module cache (Java, C#). Ở đây em vẫn đạt đúng intent của Singleton.
const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { module: "order" },
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } }
      : undefined,
});

export const pinoLogger: ILogger = {
  info: (message, context) => logger.info(context ?? {}, message),
  warn: (message, context) => logger.warn(context ?? {}, message),
  error: (message, context) => logger.error(context ?? {}, message),
};
