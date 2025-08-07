import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import feedbackService from "../services/feedback.service.js";

const feedbackRoute = Router();

feedbackRoute.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { content, type } = req.body;
    const result = await feedbackService(req.userId, content, type);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default feedbackRoute;
