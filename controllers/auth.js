import { Router } from "express";
import { getTokenFrom } from "../utils/utils.js";
import authService from "../services/auth.service.js";

const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { username, name, password } = req.body;
    const result = await authService.register(username, name, password);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = getTokenFrom(req);
    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }
    const result = await authService.logout(token);
    return res.status(200).json(result);
  } catch (error) {
    res.json({ error: error.message });
    next(error);
  }
});

export default authRouter;
