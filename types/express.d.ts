import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: User; // or any other type you expect for 'user'

    }
  }
}
