"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const board_route_1 = __importDefault(require("./board.route"));
const comment_route_1 = __importDefault(require("./comment.route"));
const pin_route_1 = __importDefault(require("./pin.route"));
const user_route_1 = __importDefault(require("./user.route"));
const router = express_1.default.Router();
exports.default = () => {
    (0, user_route_1.default)(router);
    (0, pin_route_1.default)(router);
    (0, board_route_1.default)(router);
    (0, comment_route_1.default)(router);
    return router;
};
