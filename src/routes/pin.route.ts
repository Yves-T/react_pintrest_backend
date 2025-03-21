import {
  createPin,
  getPin,
  getPins,
  interact,
  interactionCheck,
} from "@controllers/pin.controller";
import { verifyToken } from "@middlewares/verifyToken";
import express, { Router } from "express";

const router = express.Router();

const prefix = "/pins";

export default (router: Router): void => {
  router.get(`${prefix}/`, getPins);
  router.get(`${prefix}/:id`, getPin);
  router.post(`${prefix}/`, verifyToken, createPin);
  router.get(`${prefix}/interaction-check/:id`, interactionCheck);
  router.post(`${prefix}/interact/:id`, verifyToken, interact);
};
