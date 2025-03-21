import Follow from "@models/follow.model";
import User from "@models/user.model";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  const { username, displayName, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const newHashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    displayName,
    email,
    hashedPassword: newHashedPassword,
  });

  if (user) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const { hashedPassword, ...detailsWithoutPassword } = user.toJSON();
    res.status(200).json({ results: [detailsWithoutPassword] });
  } else {
    res.status(401).json({ results: [] });
  }

  res.status(201).json();
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

  if (!isPasswordCorrect) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const { hashedPassword, ...detailsWithoutPassword } = user.toJSON();
  res.status(200).json({ results: [detailsWithoutPassword] });
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successfull" });
};

export const getUser = async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (user) {
    const { hashedPassword, ...detailsWithoutPassword } = user.toJSON();
    const followerCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });

    const token = req.cookies.token;
    if (!token) {
      res.status(200).json({
        results: [
          {
            ...detailsWithoutPassword,
            followerCount,
            followingCount,
            isFollowing: false,
          },
        ],
      });
      return;
    } else {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const { userId } = decoded as { userId: string };
        const isExists = await Follow.exists({
          follower: userId,
          following: user._id,
        });

        res.status(200).json({
          results: [
            {
              ...detailsWithoutPassword,
              followerCount,
              followingCount,
              isFollowing: isExists ? true : false,
            },
          ],
        });
        return;
      } catch (error) {
        console.log("error", error);
        res.status(403).json({ message: "Token is invalid!" });
      }
    }

    res.status(200).json({ results: [detailsWithoutPassword] });
  } else {
    res.status(401).json({ results: [] });
  }
};

export const followUser = async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  const isFollowing = await Follow.exists({
    follower: req.userId,
    following: user?._id,
  });

  if (isFollowing) {
    await Follow.deleteOne({
      follower: req.userId,
      following: user?._id,
    });
  } else {
    await Follow.create({
      follower: req.userId,
      following: user?._id,
    });
  }
  res.status(200).json({ message: "Successful" });
};
