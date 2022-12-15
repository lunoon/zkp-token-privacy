import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (Object.keys(req.body).length === 0) {
      console.log(req.params);
    } else {
      console.log(req.body);
    }
    next();
  }
}
