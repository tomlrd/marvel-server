const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    // Vérifier si le header Authorization est présent
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Token manquant" });
    }

    // Extraire le token du header "Bearer <token>"
    const token = req.headers.authorization.replace("Bearer ", "");
    console.log("Token reçu:", token);

    // Chercher l'utilisateur avec ce token
    const user = await User.findOne({ token: token });
    if (!user) {
      console.log("Aucun utilisateur trouvé avec ce token");
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    console.log("Utilisateur trouvé:", user._id);
    // Ajouter l'utilisateur à l'objet request pour l'utiliser dans les routes
    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
