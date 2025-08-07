import { Router } from "express";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import deckService from "../services/deck.service.js";

const decksRouter = Router();

decksRouter.use(authenticateToken);

decksRouter.get("/", async (req, res, next) => {
  try {
    const result = await deckService.getAllDecks(req.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

decksRouter.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    const result = await deckService.createDeck(name, req.userId);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

decksRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await deckService.updateDeck(id, req.userId, name);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

decksRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await deckService.deleteDeck(id, req.userId);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default decksRouter;
