import { Request, Response, NextFunction } from "express";

export function buildRequestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const started = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - started;
      console.log(
        `${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
      );
    });
    next();
  };
}
