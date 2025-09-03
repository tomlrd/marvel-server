const express = require("express");
const router = express.Router();
const axios = require("axios");
const apiKey = process.env.MARVEL_API_KEY;
const apiUri = process.env.MARVEL_API_URI;

// Route : /characters - Get a list of characters
router.get("/", async (req, res) => {
  try {
    const { limit, skip, name } = req.query;
    let url = `${apiUri}/characters?apiKey=${apiKey}`;

    if (limit) url += `&limit=${limit}`;
    if (skip) url += `&skip=${skip}`;
    if (name) url += `&name=${name}`;

    const response = await axios.get(url);
    console.log(response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route : /characters/:characterId - Get specific character information
router.get("/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const url = `${apiUri}/character/${characterId}?apiKey=${apiKey}`;

    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route : /characters/byIds - Get multiple characters by their IDs
router.post("/byIds", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "IDs array is required" });
    }

    // Récupérer tous les personnages en parallèle
    const characterPromises = ids.map(async (id) => {
      try {
        const url = `${apiUri}/character/${id}?apiKey=${apiKey}`;
        const response = await axios.get(url);
        // L'API peut retourner soit directement l'objet, soit { results: [...] }
        const character = response.data;
        return character || null;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération du personnage ${id}:`,
          error.message
        );
        return null;
      }
    });

    const characters = await Promise.all(characterPromises);
    const validCharacters = characters.filter((char) => char !== null);

    return res.status(200).json({
      count: validCharacters.length,
      results: validCharacters,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
