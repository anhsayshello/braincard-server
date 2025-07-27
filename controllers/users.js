import { Router } from "express";
import User from "../models/user.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import userService from "../services/user.service.js";

const usersRouter = Router();

usersRouter.get("/", async (_req, res) => {
  const users = await User.find({});
  res.json(users);
});

usersRouter.get("/stats", authenticateToken, async (req, res, next) => {
  try {
    const result = await userService.getStats(req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
