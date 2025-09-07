const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Configuration CORS
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const charactersRoutes = require("./routes/characters");
    const comicsRoutes = require("./routes/comics");
    const userRoutes = require("./routes/user");

    app.use("/user", userRoutes);
    app.use("/characters", charactersRoutes);
    app.use("/comics", comicsRoutes);

    app.get("/", (req, res) => {
      try {
        return res.status(200).json("Bienvenue sur Marvel");
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    });

    app.all(/.*/, (req, res) => {
      return res.status(404).json({ message: "Not found" });
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("server error : ", error.message);
    process.exit(1);
  }
};

startServer();
