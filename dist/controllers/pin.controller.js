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
exports.interact = exports.interactionCheck = exports.createPin = exports.getPin = exports.getPins = void 0;
const like_model_1 = __importDefault(require("../models/like.model"));
const pin_model_1 = __importDefault(require("../models/pin.model"));
const board_model_1 = __importDefault(require("../models/board.model"));
const save_model_1 = __importDefault(require("../models/save.model"));
const imagekit_1 = __importDefault(require("imagekit"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sharp_1 = __importDefault(require("sharp"));
const getPins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pageNumber = Number(req.query.cursor) || 0;
    const search = req.query.search;
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const LIMIT = 21;
    const pins = yield pin_model_1.default.find(search
        ? {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { tags: { $in: [search] } }, // search inside tags array
            ],
        }
        : userId
            ? { user: userId }
            : boardId
                ? { board: boardId }
                : {})
        .limit(LIMIT)
        .skip(pageNumber * LIMIT);
    const hasNextPage = pins.length === LIMIT;
    res
        .status(200)
        .json({ results: pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
});
exports.getPins = getPins;
const getPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const pin = yield pin_model_1.default.findById(id).populate("user", "username img displayname");
    res.status(200).json({ results: [pin] });
});
exports.getPin = getPin;
const createPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { title, description, link, board, tags, textOptions, canvasOptions, newBoard, } = req.body;
    const media = (_a = req.files) === null || _a === void 0 ? void 0 : _a.media;
    if (!title || !description || !media) {
        res.status(400).json({ message: "All fields are required!" });
        return;
    }
    const parsedTextOptions = JSON.parse(textOptions || "{}");
    const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");
    const metadata = yield (0, sharp_1.default)(media === null || media === void 0 ? void 0 : media.data).metadata();
    if (!metadata.height && !metadata.width) {
        res.status(400).json({ message: "All fields are required!" });
        return;
    }
    const originalOrientation = metadata.width < metadata.height ? "portrait" : "landscape";
    const originalAspectRatio = metadata.width / metadata.height;
    let clientAspectRatio = 1;
    let width;
    let height;
    if (parsedCanvasOptions.size !== "original") {
        clientAspectRatio =
            parsedCanvasOptions.size.split(":")[0] /
                parsedCanvasOptions.size.split(":")[1];
    }
    else {
        parsedCanvasOptions.orientation === originalOrientation
            ? (clientAspectRatio = originalAspectRatio)
            : (clientAspectRatio = 1 / originalAspectRatio);
    }
    width = (_b = metadata.width) !== null && _b !== void 0 ? _b : 0;
    height = metadata.width / clientAspectRatio;
    const imagekit = new imagekit_1.default({
        publicKey: process.env.IK_PUBLIC_KEY,
        privateKey: process.env.IK_PRIVATE_KEY,
        urlEndpoint: process.env.IK_URL_ENDPOINT,
    });
    const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
    const textTopPosition = Math.round((parsedTextOptions.top * height) / parsedCanvasOptions.height);
    let croppingStrategy = "";
    if (parsedCanvasOptions.size !== "original") {
        if (originalAspectRatio > clientAspectRatio) {
            croppingStrategy = ",cm-pad_resize";
        }
    }
    else {
        if (originalOrientation === "landscape" &&
            parsedCanvasOptions.orientation === "portrait") {
            croppingStrategy = ",cm-pad_resize";
        }
    }
    const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(1)}${parsedTextOptions.text
        ? `,l-text,i-${parsedTextOptions.text},fs-${parsedTextOptions.fontSize * 2.1},lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(1)},l-end`
        : ""}`;
    imagekit
        .upload({
        file: media.data,
        fileName: media.name,
        folder: "test",
        transformation: {
            pre: transformationString,
        },
    })
        .then((response) => __awaiter(void 0, void 0, void 0, function* () {
        let newBoardId;
        if (newBoard) {
            const res = yield board_model_1.default.create({
                title: newBoard,
                user: req.userId,
            });
            newBoardId = res._id;
        }
        const newPin = yield pin_model_1.default.create({
            user: req.userId,
            title,
            description,
            link: link || null,
            board: newBoardId || board || null,
            tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
            media: response.filePath,
            width: response.width,
            height: response.height,
        });
        res.status(201).json(newPin);
        return;
    }))
        .catch((err) => {
        console.log(err);
        res.status(500).json(err);
        return;
    });
});
exports.createPin = createPin;
const interactionCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const token = req.cookies.token;
    const likeCount = yield like_model_1.default.countDocuments({ pin: id });
    if (!token) {
        res.status(200).json({ likeCount, isLiked: false, isSaved: false });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;
        const isLiked = yield like_model_1.default.findOne({ user: userId, pin: id });
        const isSaved = yield save_model_1.default.findOne({ user: userId, pin: id });
        res.status(200).json({
            results: [
                {
                    likeCount,
                    isLiked: isLiked ? true : false,
                    isSaved: isSaved ? true : false,
                },
            ],
        });
    }
    catch (error) {
        res
            .status(200)
            .json({ results: [{ likeCount, isLiked: false, isSaved: false }] });
    }
});
exports.interactionCheck = interactionCheck;
const interact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { type } = req.body;
    if (type === "like") {
        const isLiked = yield like_model_1.default.findOne({ pin: id, user: req.userId });
        if (isLiked) {
            yield like_model_1.default.deleteOne({ pin: id, user: req.userId });
        }
        else {
            yield like_model_1.default.create({ pin: id, user: req.userId });
        }
    }
    else {
        const isSaved = yield save_model_1.default.findOne({ pin: id, user: req.userId });
        if (isSaved) {
            yield save_model_1.default.deleteOne({ pin: id, user: req.userId });
        }
        else {
            yield save_model_1.default.create({ pin: id, user: req.userId });
        }
    }
    res.status(200).json({ message: "Successful" });
});
exports.interact = interact;
