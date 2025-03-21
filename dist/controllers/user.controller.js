"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUser = exports.getUser = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const follow_model_1 = __importDefault(require("../models/follow.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, displayName, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    const newHashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const user = yield user_model_1.default.create({
        username,
        displayName,
        email,
        hashedPassword: newHashedPassword,
    });
    if (user) {
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        const _a = user.toJSON(), { hashedPassword } = _a, detailsWithoutPassword = __rest(_a, ["hashedPassword"]);
        res.status(200).json({ results: [detailsWithoutPassword] });
    }
    else {
        res.status(401).json({ results: [] });
    }
    res.status(201).json();
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    const user = yield user_model_1.default.findOne({ email });
    if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }
    const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.hashedPassword);
    if (!isPasswordCorrect) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const _a = user.toJSON(), { hashedPassword } = _a, detailsWithoutPassword = __rest(_a, ["hashedPassword"]);
    res.status(200).json({ results: [detailsWithoutPassword] });
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successfull" });
});
exports.logoutUser = logoutUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const user = yield user_model_1.default.findOne({ username });
    if (user) {
        const _a = user.toJSON(), { hashedPassword } = _a, detailsWithoutPassword = __rest(_a, ["hashedPassword"]);
        const followerCount = yield follow_model_1.default.countDocuments({ following: user._id });
        const followingCount = yield follow_model_1.default.countDocuments({ follower: user._id });
        const token = req.cookies.token;
        if (!token) {
            res.status(200).json({
                results: [
                    Object.assign(Object.assign({}, detailsWithoutPassword), { followerCount,
                        followingCount, isFollowing: false }),
                ],
            });
            return;
        }
        else {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const { userId } = decoded;
                const isExists = yield follow_model_1.default.exists({
                    follower: userId,
                    following: user._id,
                });
                res.status(200).json({
                    results: [
                        Object.assign(Object.assign({}, detailsWithoutPassword), { followerCount,
                            followingCount, isFollowing: isExists ? true : false }),
                    ],
                });
                return;
            }
            catch (error) {
                console.log("error", error);
                res.status(403).json({ message: "Token is invalid!" });
            }
        }
        res.status(200).json({ results: [detailsWithoutPassword] });
    }
    else {
        res.status(401).json({ results: [] });
    }
});
exports.getUser = getUser;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const user = yield user_model_1.default.findOne({ username });
    const isFollowing = yield follow_model_1.default.exists({
        follower: req.userId,
        following: user === null || user === void 0 ? void 0 : user._id,
    });
    if (isFollowing) {
        yield follow_model_1.default.deleteOne({
            follower: req.userId,
            following: user === null || user === void 0 ? void 0 : user._id,
        });
    }
    else {
        yield follow_model_1.default.create({
            follower: req.userId,
            following: user === null || user === void 0 ? void 0 : user._id,
        });
    }
    res.status(200).json({ message: "Successful" });
});
exports.followUser = followUser;
