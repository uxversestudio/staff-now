const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const cors = require("cors");

const app = express();
const port = 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal para obtener los trabajos
app.get("/jobs", async (req, res) => {
  try {
    // Obtener datos del API de Zenople
    const response = await axios.get(
      "https://associatesapi.zenople.com/api/Job/JobPortalXml?jobPortal=zenople"
    );

    // Convertir XML a JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(response.data, (err, result) => {
      if (err) {
        throw new Error("Error al parsear XML");
      }
      res.json(result);
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener los trabajos",
      message: error.message,
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
