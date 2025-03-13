const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de seguridad básica
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || "*",
    methods: ["GET"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de estado de salud
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Ruta principal para obtener los trabajos
app.get("/jobs", async (req, res) => {
  try {
    const response = await axios.get(
      "https://associatesapi.zenople.com/api/Job/JobPortalXml?jobPortal=zenople",
      {
        timeout: 5000, // Timeout de 5 segundos
        headers: {
          Accept: "application/xml",
          "User-Agent": "StaffNow/1.0",
        },
      }
    );

    const parser = new xml2js.Parser({
      explicitArray: false,
      trim: true,
      normalize: true,
    });

    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error("Error al parsear XML:", err);
        throw new Error("Error al parsear XML");
      }
      res.json(result);
    });
  } catch (error) {
    console.error("Error en /jobs:", error);
    res.status(500).json({
      error: "Error al obtener los trabajos",
      message: error.message,
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "development" ? err.message : "Error interno",
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});

// Manejo de señales de terminación
process.on("SIGTERM", () => {
  console.log("Recibida señal SIGTERM. Cerrando servidor...");
  process.exit(0);
});
