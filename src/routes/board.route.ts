import { getUserBoards } from "@controllers/board.controller";
import express, { Router } from "express";

const router = express.Router();

const prefix = "/boards";

export default (router: Router): void => {
  router.get(`${prefix}/:userId`, getUserBoards);
};
