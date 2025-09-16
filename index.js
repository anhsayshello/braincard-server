import express from "express";
import logger from "./utils/logger.js";
import config from "./utils/config.js";
import mongoose from "mongoose";
import cors from "cors";
import usersRouter from "./controllers/users.controller.js";
import decksRouter from "./controllers/decks.controller.js";
import searchRouter from "./controllers/search.controller.js";
import feedbackRoute from "./controllers/feedback.controller.js";
import notificationRoute from "./controllers/notifications.controller.js";
import unknownEndpoint from "./middlewares/unknownEndpoint.middleware.js";
import cardsRouter from "./controllers/cards.controller.js";
import errorHandler from "./middlewares/error.middleware.js";
import authRouter from "./controllers/auth.controller.js";

const app = express();

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.info("error connection to MongoDB", error.message);
  });

app.use(express.json());
app.use(
  cors({
    origin: ["https://braincard-booster.vercel.app", "http://localhost:3000"],
  })
);

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/decks", decksRouter);
app.use("/decks", cardsRouter);

app.use("/search", searchRouter);
app.use("/feedback", feedbackRoute);
app.use("/notification", notificationRoute);

app.use(unknownEndpoint);
app.use(errorHandler);

// app.listen(config.PORT, () => {
//   logger.info(`Server running on port ${config.PORT}`);
// });

export default app;
