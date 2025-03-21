import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const { userId } = decoded as { userId: string };
    req.userId = userId;
    next();
  } catch (error) {
    console.log("error", error);
    res.status(403).json({ message: "Token is invalid!" });
  }
};
