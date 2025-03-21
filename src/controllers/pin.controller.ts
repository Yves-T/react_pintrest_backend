import Like from "@models/like.model";
import Pin from "@models/pin.model";
import Board from "@models/board.model";
import Save from "@models/save.model";
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import Imagekit from "imagekit";
import jwt from "jsonwebtoken";
import sharp from "sharp";

export const getPins = async (req: Request, res: Response) => {
  const pageNumber = Number(req.query.cursor) || 0;
  const search = req.query.search;
  const userId = req.query.userId;
  const boardId = req.query.boardId;
  const LIMIT = 21;
  const pins = await Pin.find(
    search
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
      : {}
  )
    .limit(LIMIT)
    .skip(pageNumber * LIMIT);
  const hasNextPage = pins.length === LIMIT;

  res
    .status(200)
    .json({ results: pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
};

export const getPin = async (req: Request, res: Response) => {
  const { id } = req.params;

  const pin = await Pin.findById(id).populate(
    "user",
    "username img displayname"
  );

  res.status(200).json({ results: [pin] });
};

export const createPin = async (req: Request, res: Response) => {
  const {
    title,
    description,
    link,
    board,
    tags,
    textOptions,
    canvasOptions,
    newBoard,
  } = req.body;
  const media = req.files?.media as UploadedFile;

  if (!title || !description || !media) {
    res.status(400).json({ message: "All fields are required!" });
    return;
  }

  const parsedTextOptions = JSON.parse(textOptions || "{}");
  const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

  const metadata = await sharp(media?.data).metadata();
  if (!metadata.height && !metadata.width) {
    res.status(400).json({ message: "All fields are required!" });
    return;
  }

  const originalOrientation =
    metadata.width! < metadata.height! ? "portrait" : "landscape";
  const originalAspectRatio = metadata.width! / metadata.height!;

  let clientAspectRatio = 1;
  let width;
  let height;

  if (parsedCanvasOptions.size !== "original") {
    clientAspectRatio =
      parsedCanvasOptions.size.split(":")[0] /
      parsedCanvasOptions.size.split(":")[1];
  } else {
    parsedCanvasOptions.orientation === originalOrientation
      ? (clientAspectRatio = originalAspectRatio)
      : (clientAspectRatio = 1 / originalAspectRatio);
  }

  width = metadata.width ?? 0;
  height = metadata.width! / clientAspectRatio;

  const imagekit = new Imagekit({
    publicKey: process.env.IK_PUBLIC_KEY!,
    privateKey: process.env.IK_PRIVATE_KEY!,
    urlEndpoint: process.env.IK_URL_ENDPOINT!,
  });

  const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
  const textTopPosition = Math.round(
    (parsedTextOptions.top * height) / parsedCanvasOptions.height
  );

  let croppingStrategy = "";

  if (parsedCanvasOptions.size !== "original") {
    if (originalAspectRatio > clientAspectRatio) {
      croppingStrategy = ",cm-pad_resize";
    }
  } else {
    if (
      originalOrientation === "landscape" &&
      parsedCanvasOptions.orientation === "portrait"
    ) {
      croppingStrategy = ",cm-pad_resize";
    }
  }

  const transformationString = `w-${width},h-${height}${croppingStrategy},bg-${parsedCanvasOptions.backgroundColor.substring(
    1
  )}${
    parsedTextOptions.text
      ? `,l-text,i-${parsedTextOptions.text},fs-${
          parsedTextOptions.fontSize * 2.1
        },lx-${textLeftPosition},ly-${textTopPosition},co-${parsedTextOptions.color.substring(
          1
        )},l-end`
      : ""
  }`;

  imagekit
    .upload({
      file: media.data,
      fileName: media.name,
      folder: "test",
      transformation: {
        pre: transformationString,
      },
    })
    .then(async (response) => {
      let newBoardId;

      if (newBoard) {
        const res = await Board.create({
          title: newBoard,
          user: req.userId,
        });
        newBoardId = res._id;
      }

      const newPin = await Pin.create({
        user: req.userId,
        title,
        description,
        link: link || null,
        board: newBoardId || board || null,
        tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
        media: response.filePath,
        width: response.width,
        height: response.height,
      });
      res.status(201).json(newPin);
      return;
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
      return;
    });
};

export const interactionCheck = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.cookies.token;

  const likeCount = await Like.countDocuments({ pin: id });

  if (!token) {
    res.status(200).json({ likeCount, isLiked: false, isSaved: false });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const { userId } = decoded as { userId: string };
    const isLiked = await Like.findOne({ user: userId, pin: id });
    const isSaved = await Save.findOne({ user: userId, pin: id });
    res.status(200).json({
      results: [
        {
          likeCount,
          isLiked: isLiked ? true : false,
          isSaved: isSaved ? true : false,
        },
      ],
    });
  } catch (error) {
    res
      .status(200)
      .json({ results: [{ likeCount, isLiked: false, isSaved: false }] });
  }
};

export const interact = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { type } = req.body;
  if (type === "like") {
    const isLiked = await Like.findOne({ pin: id, user: req.userId });
    if (isLiked) {
      await Like.deleteOne({ pin: id, user: req.userId });
    } else {
      await Like.create({ pin: id, user: req.userId });
    }
  } else {
    const isSaved = await Save.findOne({ pin: id, user: req.userId });
    if (isSaved) {
      await Save.deleteOne({ pin: id, user: req.userId });
    } else {
      await Save.create({ pin: id, user: req.userId });
    }
  }

  res.status(200).json({ message: "Successful" });
};
