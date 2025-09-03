const express = require("express");
const router = express.Router();
const axios = require("axios");
const apiKey = process.env.MARVEL_API_KEY;
const apiUri = process.env.MARVEL_API_URI;

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

// Route : /comics/:characterId - Get comics containing a specific character
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

// Route : /comic/:comicId - Get specific comic information
router.get("/comic/:comicId", async (req, res) => {
  try {
    const { comicId } = req.params;
    const url = `${apiUri}/comic/${comicId}?apiKey=${apiKey}`;

    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
