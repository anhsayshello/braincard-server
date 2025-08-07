import { Router } from "express";
import User from "../models/user.model.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import userService from "../services/user.service.js";

const usersRouter = Router();

usersRouter.get("/", async (_req, res) => {
  const users = await User.find({});
  res.json(users);
});

usersRouter.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const result = await userService.getMe(req.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", authenticateToken, async (req, res, next) => {
  const { name } = req.body;
  try {
    const result = await userService.updateUser(req.userId, name);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
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
