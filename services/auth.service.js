import config from "../utils/config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppError from "../utils/apperror.js";
import User from "../models/user.model.js";

const authService = {
  async register(username, name, password) {
    if (!username || !name || !password) {
      throw new AppError("Username, name and password are required", 400);
    }

    const usernameChecking = await User.findOne({ username: username });
    if (usernameChecking) {
      throw new AppError("username already exist", 400);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    };

    const token = jwt.sign(userForToken, config.SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    return {
      access_token: token,
      expires: "1d",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        name: savedUser.name,
      },
    };
  },

  async login(username, password) {
    const user = await User.findOne({ username });
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      throw new AppError(
        "Login failed: username or password is incorrect",
        401
      );
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, config.SECRET, {
      expiresIn: 60 * 60 * 24,
    });
    console.log(token);

    return {
      access_token: token,
      expires: "1d",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
      },
    };
  },

  async logout(token) {
    const decodedToken = jwt.verify(token, config.SECRET);
    if (!decodedToken.id) {
      throw new AppError("Invalid token", 400);
    }
    return {
      message: "Logged out successfully",
    };
  },
};

export default authService;
