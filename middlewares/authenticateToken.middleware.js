import jwt from "jsonwebtoken";
import { getTokenFrom } from "../utils/utils.js";
import config from "../utils/config.js";

export default function authenticateToken(req, res, next) {
  try {
    const token = getTokenFrom(req);
    // Handle null token case
    if (!token) {
      return res.status(401).json({ error: "token missing" });
    }

    const decodedToken = jwt.verify(token, config.JWT_SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    next(error);
  }
}
