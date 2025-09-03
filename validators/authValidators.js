const { body } = require("express-validator");
const {
  handleValidationErrors,
} = require("../middlewares/validationMiddleware");

// Validateurs pour l'inscription
const signupValidators = [
  body("email")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  handleValidationErrors,
];

// Validateurs pour la connexion
const loginValidators = [
  body("email")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Le mot de passe est requis"),
  handleValidationErrors,
];

module.exports = {
  signupValidators,
  loginValidators,
};
