"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const board_controller_1 = require("../controllers/board.controller");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prefix = "/boards";
exports.default = (router) => {
    router.get(`${prefix}/:userId`, board_controller_1.getUserBoards);
};
