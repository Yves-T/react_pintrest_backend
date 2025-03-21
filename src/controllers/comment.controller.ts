import Comment from "@models/comment.model";
import { Request, Response } from "express";

export const getPostComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const comments = await Comment.find({ pin: postId })
    .populate("user", "username img displayName")
    .sort({ createdAt: -1 });

  res.status(200).send({ results: comments });
};

export const addComment = async (req: Request, res: Response) => {
  const { description, pin } = req.body;
  const userId = req.userId;
  const comment = await Comment.create({
    description,
    pin,
    user: userId,
  });
  res.status(201).json(comment);
};
