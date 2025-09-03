const express = require("express");
const fetch = require("node-fetch");
const serverless = require("serverless-http");

const app = express();

app.get("/screenshots/:steamid", async (req, res) => {
  const { steamid } = req.params;
  const API_KEY = process.env.STEAM_API_KEY;

  const url = `https://api.steampowered.com/IPublishedFileService/GetUserFiles/v1/?key=${API_KEY}&steamid=${steamid}&filetype=4&numperpage=100`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados da Steam" });
  }
});

module.exports.handler = serverless(app); // Vercel precisa do handler exportado
