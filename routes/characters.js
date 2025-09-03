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

module.exports = router;
