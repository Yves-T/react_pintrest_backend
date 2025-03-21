"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const connectDB_1 = __importDefault(require("./util/connectDB"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL, credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_fileupload_1.default)());
app.use("/", (0, routes_1.default)());
app.listen(port, () => {
    (0, connectDB_1.default)();
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
