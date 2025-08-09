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

authRouter.post("/usernameLogin", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.usernameLogin(username, password);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/googleLogin", async (req, res, next) => {
  try {
    const { code } = req.query;
    console.log(code);
    const result = await authService.googleLogin(code);
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
