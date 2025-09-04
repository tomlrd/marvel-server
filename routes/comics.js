const express = require("express");
const router = express.Router();
const axios = require("axios");
const apiKey = process.env.MARVEL_API_KEY;
const apiUri = process.env.MARVEL_API_URI;

// Route de test pour vérifier la configuration
router.get("/test", async (req, res) => {
  try {
    console.log("API Key:", apiKey ? "Présente" : "Manquante");
    console.log("API URI:", apiUri);
    return res.status(200).json({
      message: "Configuration OK",
      hasApiKey: !!apiKey,
      apiUri: apiUri,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route : /comics - Get a list of comics
router.get("/", async (req, res) => {
  try {
    const { limit, skip, title } = req.query;
    let url = `${apiUri}/comics?apiKey=${apiKey}`;

    if (limit) url += `&limit=${limit}`;
    if (skip) url += `&skip=${skip}`;
    if (title) url += `&title=${title}`;

    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route : /comics/byIds - Get multiple comics by their IDs (DOIT ÊTRE AVANT LES ROUTES AVEC PARAMÈTRES)
router.post("/byIds", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "IDs array is required" });
    }

    // Récupérer tous les comics en parallèle
    const comicPromises = ids.map(async (id) => {
      try {
        const url = `${apiUri}/comic/${id}?apiKey=${apiKey}`;
        const response = await axios.get(url);
        // L'API peut retourner soit directement l'objet, soit { results: [...] }
        const comic = response.data;
        return comic || null;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du comic ${id}:`,
          error.message
        );
        return null;
      }
    });

    const comics = await Promise.all(comicPromises);
    const validComics = comics.filter((comic) => comic !== null);

    return res.status(200).json({
      count: validComics.length,
      results: validComics,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route : /comics/comic/:comicId - Get specific comic information
router.get("/comic/:comicId", async (req, res) => {
  try {
    const { comicId } = req.params;
    const url = `${apiUri}/comic/${comicId}?apiKey=${apiKey}`;

    console.log("URL appelée pour comic:", url);
    const response = await axios.get(url);
    console.log("Réponse reçue pour comic:", response.status);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération du comic:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

// Route : /comics/:characterId - Get comics containing a specific character (DOIT ÊTRE EN DERNIER)
router.get("/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const url = `${apiUri}/comics/${characterId}?apiKey=${apiKey}`;

    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
