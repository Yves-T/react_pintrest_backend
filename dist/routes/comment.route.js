"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_controller_1 = require("../controllers/comment.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prefix = "/comments";
exports.default = (router) => {
    router.get(`${prefix}/:postId`, comment_controller_1.getPostComments);
    router.post(`${prefix}/`, verifyToken_1.verifyToken, comment_controller_1.addComment);
};
