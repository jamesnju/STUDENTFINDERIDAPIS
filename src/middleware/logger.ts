import express from "express"

const logger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
    );
    next();
  };
  export default logger;
  