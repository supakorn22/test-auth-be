import { Request, Response, NextFunction } from 'express';

const logIpMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`IP address: ${ip}`);
  next();
};

export default logIpMiddleware;
