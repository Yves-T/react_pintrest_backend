"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../controllers/user.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prefix = "/users";
exports.default = (router) => {
    router.get(`${prefix}/:username`, user_controller_1.getUser);
    router.post(`${prefix}/auth/register`, user_controller_1.registerUser);
    router.post(`${prefix}/auth/login`, user_controller_1.loginUser);
    router.post(`${prefix}/auth/logout`, user_controller_1.logoutUser);
    router.post(`${prefix}/follow/:username`, verifyToken_1.verifyToken, user_controller_1.followUser);
};
