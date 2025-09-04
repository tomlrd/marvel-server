const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  signupValidators,
  loginValidators,
} = require("../validators/authValidators");

// SIGNUP
router.post("/signup", signupValidators, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // Les validateurs express-validator s'occupent déjà de la validation
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    const newUser = new User({
      email,
      token,
      hash,
      salt,
    });
    await newUser.save();
    return res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      favorites: newUser.favorites,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// LOGIN
router.post("/login", loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" }); // flou
    }
    const newHash = SHA256(password + user.salt).toString(encBase64);
    if (newHash !== user.hash) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" }); // flou
    }
    return res.status(200).json({
      _id: user._id,
      token: user.token,
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// GET CURRENT USER PROFILE
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    console.log("req.user:", req.user);
    console.log("req.user._id:", req.user._id);

    const user = await User.findById(req.user._id).select("-hash -salt -token");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Erreur dans /user/profile:", error);
    return res.status(500).json({ message: error.message });
  }
});

// GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-hash -salt -token");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// TOGGLE FAVORITE (COMIC OU CHARACTER)
router.post("/favorites/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'comic' ou 'character'
    const userId = req.user._id;

    if (!type || !["comic", "character"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type invalide. Doit être 'comic' ou 'character'" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const favoritesArray = user.favorites[type + "s"]; // 'comics' ou 'characters'
    const itemIndex = favoritesArray.indexOf(id);

    if (itemIndex > -1) {
      // Retirer l'élément des favoris
      favoritesArray.splice(itemIndex, 1);
    } else {
      // Ajouter l'élément aux favoris
      favoritesArray.push(id);
    }

    await user.save();
    return res.status(200).json({
      message:
        itemIndex > -1
          ? `${type} retiré des favoris`
          : `${type} ajouté aux favoris`,
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
