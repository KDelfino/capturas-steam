// server.js
import express from "express";
import fetch from "node-fetch"; 

const app = express();
const PORT = 3000;

// coloque aqui sua chave da Steam
const API_KEY = "6F141FC911E44BA6D459690C740AAEB0";


app.get("/screenshots/:steamid", async (req, res) => {
  const steamId = req.params.steamid;
  // Adicione numperpage=30 para pegar até 30 screenshots
  const url = `https://api.steampowered.com/IPublishedFileService/GetUserFiles/v1/?key=${API_KEY}&steamid=${steamId}&filetype=4&numperpage=100`;

  try {
    const response = await fetch(url);
    const data = await response.json();

   
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados da Steam" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
