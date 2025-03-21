import { addComment, getPostComments } from "@controllers/comment.controller";
import { verifyToken } from "@middlewares/verifyToken";
import express, { Router } from "express";

const router = express.Router();

const prefix = "/comments";

export default (router: Router): void => {
  router.get(`${prefix}/:postId`, getPostComments);
  router.post(`${prefix}/`, verifyToken, addComment);
};
