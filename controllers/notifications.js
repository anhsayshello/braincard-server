import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import notificationService from "../services/notification.service.js";

const notificationRoute = Router();

notificationRoute.use(authenticateToken);

notificationRoute.get("/unread-count", async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadNotification(req.userId);
    return res.status(200).json({ unreadCount: result });
  } catch (error) {
    next(error);
  }
});

notificationRoute.get("/", async (req, res, next) => {
  try {
    const result = await notificationService.getAllNotifications(req.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

notificationRoute.post("/", async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const result = await notificationService.createNotification(
      req.userId,
      title,
      content
    );
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

notificationRoute.put("/all", async (_req, res, next) => {
  try {
    const result = await notificationService.readAllNotification();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

notificationRoute.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await notificationService.readOneNotification(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

notificationRoute.delete("/all", async (_req, res, next) => {
  try {
    const result = await notificationService.deleteAllNotifications();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

notificationRoute.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.deleteNotificationById(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default notificationRoute;
