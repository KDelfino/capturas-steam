const url = "http://localhost:3000/screenshots/76561198930612193";

async function preencherCarrossel() {
  const res = await fetch(url);
  const data = await res.json();

  if (data.response && data.response.publishedfiledetails.length > 0) {
    const captures = data.response.publishedfiledetails;
    // Preenche até 8 páginas (4 itens, cada um com left/right)
    for (let i = 0; i < 8; i += 2) {
      // Left
      const imgLeft = document.getElementById(`capturaLivro${i+1}`);
      const tituloLeft = document.getElementById(`tituloJogo${i+1}`);
      const descLeft = document.getElementById(`descricaoJogo${i+1}`);

      if (imgLeft && captures[i]) {
        imgLeft.src = captures[i].file_url || captures[i].preview_url || "";
        tituloLeft.textContent = captures[i].app_name || "Nome do jogo";
        descLeft.textContent = captures[i].short_description || "Sem descrição.";
      }

      // Right
      const imgRight = document.getElementById(`capturaLivro${i+2}`);
      const tituloRight = document.getElementById(`tituloJogo${i+2}`);
      const descRight = document.getElementById(`descricaoJogo${i+2}`);

      if (imgRight && captures[i+1]) {
        imgRight.src = captures[i+1].file_url || captures[i+1].preview_url || "";
        tituloRight.textContent = captures[i+1].app_name || "Nome do jogo";
        descRight.textContent = captures[i+1].short_description || "Sem descrição.";
      }
    }
  }
}

preencherCarrossel();

// ------------------------------

async function setQuadrados() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.response && data.response.publishedfiledetails.length > 0) {
      const captures = data.response.publishedfiledetails;

      // lista das classes dos quadrados na ordem
      const quadrados = ['.quadrado3', '.quadrado2', '.quadrado1'];

      // preenche cada quadrado disponível
      quadrados.forEach((classe, index) => {
        if (captures[index]) {
          document.querySelector(classe).style.backgroundImage =
            `url('${captures[index].file_url}')`;
        }
      });
    }
  } catch (err) {
    console.error("Erro ao carregar capturas:", err);
  }
}

setQuadrados();