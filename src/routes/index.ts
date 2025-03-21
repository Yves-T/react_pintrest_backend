import express from "express";
import boardRoute from "./board.route";
import commentRoute from "./comment.route";
import pinRoute from "./pin.route";
import userRoute from "./user.route";

const router = express.Router();

export default (): express.Router => {
  userRoute(router);
  pinRoute(router);
  boardRoute(router);
  commentRoute(router);

  return router;
};
