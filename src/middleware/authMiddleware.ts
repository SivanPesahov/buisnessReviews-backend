import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

interface RequestWithUserId extends Request {
  userId?: string | null;
}

interface DecodedToken extends JwtPayload {
  userId: string;
}

function verifyToken(
  req: RequestWithUserId,
  res: Response,
  next: NextFunction
): void {
  const authHeader =
    (req.headers["Authorization"] as string | undefined) ||
    (req.headers["authorization"] as string | undefined);
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader);
  if (!token) {
    console.log("auth.middleware, verifyToken. No token provided");
    res.status(401).json({ error: "Access denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(
      "auth.middleware, verifyToken. Error while verifying token",
      error
    );
    res.status(401).json({ error: "Invalid token" });
  }
}

export { verifyToken };
