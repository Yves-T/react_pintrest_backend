import {
  followUser,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@controllers/user.controller";
import { verifyToken } from "@middlewares/verifyToken";
import express, { Router } from "express";

const router = express.Router();

const prefix = "/users";

export default (router: Router): void => {
  router.get(`${prefix}/:username`, getUser);
  router.post(`${prefix}/auth/register`, registerUser);
  router.post(`${prefix}/auth/login`, loginUser);
  router.post(`${prefix}/auth/logout`, logoutUser);
  router.post(`${prefix}/follow/:username`, verifyToken, followUser);
};
