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
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const pin_model_js_1 = __importDefault(require("../models/pin.model.js"));
const board_model_js_1 = __importDefault(require("../models/board.model.js"));
const comment_model_js_1 = __importDefault(require("../models/comment.model.js"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connectDB_js_1 = __importDefault(require("./connectDB.js"));
(0, connectDB_js_1.default)();
const seedDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_js_1.default.deleteMany({});
    yield pin_model_js_1.default.deleteMany({});
    yield board_model_js_1.default.deleteMany({});
    yield comment_model_js_1.default.deleteMany({});
    const users = [];
    for (let i = 1; i <= 10; i++) {
        const hashedPassword = yield bcryptjs_1.default.hash("password123", 10);
        const user = new user_model_js_1.default({
            displayName: `User ${i}`,
            username: `user${i}`,
            email: `user${i}@example.com`,
            hashedPassword: hashedPassword,
            img: `https://picsum.photos/id/${i}/200/200`,
        });
        users.push(yield user.save());
    }
    const boards = [];
    for (const user of users) {
        for (let i = 1; i <= 10; i++) {
            const board = new board_model_js_1.default({
                title: `Board ${i} of ${user.username}`,
                user: user._id,
            });
            boards.push(yield board.save());
        }
    }
    const pins = [];
    for (const user of users) {
        const userBoards = boards.filter((board) => board.user.toString() === user._id.toString());
        for (let i = 1; i <= 10; i++) {
            const mediaSize = Math.random() < 0.5 ? "800/1200" : "800/600";
            const pin = new pin_model_js_1.default({
                media: `https://picsum.photos/id/${i + 10}/${mediaSize}`,
                width: 800,
                height: mediaSize === "800/1200" ? 1200 : 600,
                title: `Pin ${i} by ${user.username}`,
                description: `This is pin ${i} created by ${user.username}`,
                link: `https://example.com/pin${i}`,
                board: userBoards[i - 1]._id,
                tags: [`tag${i}`, "sample", user.username],
                user: user._id,
            });
            pins.push(yield pin.save());
        }
    }
    for (const user of users) {
        for (let i = 1; i <= 10; i++) {
            const randomPin = pins[Math.floor(Math.random() * pins.length)];
            const comment = new comment_model_js_1.default({
                description: `Comment ${i} by ${user.username}: This is a great pin!`,
                pin: randomPin._id,
                user: user._id,
            });
            yield comment.save();
        }
    }
    console.log("Database seeded successfully!");
    process.exit(0);
});
seedDB().catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
});
