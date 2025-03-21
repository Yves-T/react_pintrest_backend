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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.getPostComments = void 0;
const comment_model_1 = __importDefault(require("../models/comment.model"));
const getPostComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const comments = yield comment_model_1.default.find({ pin: postId })
        .populate("user", "username img displayName")
        .sort({ createdAt: -1 });
    res.status(200).send({ results: comments });
});
exports.getPostComments = getPostComments;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, pin } = req.body;
    const userId = req.userId;
    const comment = yield comment_model_1.default.create({
        description,
        pin,
        user: userId,
    });
    res.status(201).json(comment);
});
exports.addComment = addComment;
