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

// ------------------------------

function addCardTiltEffect() {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateX = ((y - midY) / midY) * 10;
      const rotateY = ((x - midX) / midX) * 10;
      card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
      card.classList.add('is-tilting');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.classList.remove('is-tilting');
    });
  });
}

// Chame após preencherCards
async function preencherCards() {
  const res = await fetch(url);
  const data = await res.json();

  if (data.response && data.response.publishedfiledetails.length > 0) {
    const captures = data.response.publishedfiledetails;
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = "";

    captures.forEach(captura => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${captura.file_url || captura.preview_url || ''}" alt="">
        <div class="info-screen">
          <h3>${captura.app_name || 'Nome do jogo'}</h3>
          <p>${captura.short_description || 'Sem descrição.'}</p>
        </div>
      `;
      // Efeito tilt
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const midX = rect.width / 2;
        const midY = rect.height / 2;
        const rotateX = ((y - midY) / midY) * 10;
        const rotateY = ((x - midX) / midX) * 10;
        card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
        card.classList.add('is-tilting');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.classList.remove('is-tilting');
      });
      // Modal ao clicar
      card.addEventListener('click', () => {
        console.log('Card clicado!');
        document.getElementById('modalImagem').src = captura.file_url || captura.preview_url || '';
        document.getElementById('modalTitulo').textContent = captura.app_name || 'Nome do jogo';
        document.getElementById('modalDescricao').textContent = captura.short_description || 'Sem descrição.';
        document.getElementById('card-modal').style.display = 'flex';
        addTiltToModalCard(); // Adiciona tilt ao card ampliado
      });
      cardsContainer.appendChild(card);
    });
  }

  // Fechar modal
  const fecharBtn = document.getElementById('fecharModal');
  if (fecharBtn) {
    fecharBtn.onclick = () => {
      document.getElementById('card-modal').style.display = 'none';
    };
  }

  document.getElementById('card-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
}

preencherCards();

function addTiltToModalCard() {
  const modalCard = document.querySelector('.card-ampliada');
  if (!modalCard) return;
  modalCard.addEventListener('mousemove', e => {
    const rect = modalCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateX = ((y - midY) / midY) * 10;
    const rotateY = ((x - midX) / midX) * 10;
    modalCard.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
    modalCard.classList.add('is-tilting');
  });
  modalCard.addEventListener('mouseleave', () => {
    modalCard.style.transform = 'scale(1.08)';
    modalCard.classList.remove('is-tilting');
  });
}

