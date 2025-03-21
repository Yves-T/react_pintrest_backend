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
exports.getUserBoards = void 0;
const board_model_1 = __importDefault(require("../models/board.model"));
const pin_model_1 = __importDefault(require("../models/pin.model"));
const getUserBoards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const boards = yield board_model_1.default.find({ user: userId });
    const boardsWithPinDetails = yield Promise.all(boards.map((board) => __awaiter(void 0, void 0, void 0, function* () {
        const pinCount = yield pin_model_1.default.countDocuments({ board: board._id });
        const firstPin = yield pin_model_1.default.findOne({ board: board._id });
        return Object.assign(Object.assign({}, board.toObject()), { pinCount, firstPin });
    })));
    res.status(200).json({ results: boardsWithPinDetails });
});
exports.getUserBoards = getUserBoards;
