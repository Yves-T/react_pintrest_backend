"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;
        req.userId = userId;
        next();
    }
    catch (error) {
        console.log("error", error);
        res.status(403).json({ message: "Token is invalid!" });
    }
};
exports.verifyToken = verifyToken;
