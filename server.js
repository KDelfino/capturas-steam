import fetch from "node-fetch";

export default async function handler(req, res) {
  const { steamid } = req.query;
  const API_KEY = process.env.STEAM_API_KEY; // ✅ use variável de ambiente no Vercel

  if (!steamid) {
    return res.status(400).json({ error: "steamid é obrigatório" });
  }

  const url = `https://api.steampowered.com/IPublishedFileService/GetUserFiles/v1/?key=${API_KEY}&steamid=${steamid}&filetype=4&numperpage=100`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*"); // libera CORS
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados da Steam" });
  }
}

