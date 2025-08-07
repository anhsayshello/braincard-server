import { Router } from "express";

import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import searchService from "../services/search.service.js";

const searchRouter = Router();

searchRouter.get("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      q,
      deckId,
      filter,
      sortBy = "created-at",
      sortOrder = "desc",
      page = "1",
    } = req.query;

    const result = await searchService(
      req.userId,
      deckId,
      q,
      filter,
      sortBy,
      sortOrder,
      page
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default searchRouter;
