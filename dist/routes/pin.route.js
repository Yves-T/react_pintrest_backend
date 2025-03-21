"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pin_controller_1 = require("../controllers/pin.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prefix = "/pins";
exports.default = (router) => {
    router.get(`${prefix}/`, pin_controller_1.getPins);
    router.get(`${prefix}/:id`, pin_controller_1.getPin);
    router.post(`${prefix}/`, verifyToken_1.verifyToken, pin_controller_1.createPin);
    router.get(`${prefix}/interaction-check/:id`, pin_controller_1.interactionCheck);
    router.post(`${prefix}/interact/:id`, verifyToken_1.verifyToken, pin_controller_1.interact);
};
