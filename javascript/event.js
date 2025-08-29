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



// Chame após preencherCards
async function preencherCards() {
  const res = await fetch(url);
  const data = await res.json();

  if (data.response && data.response.publishedfiledetails.length > 0) {
    const captures = data.response.publishedfiledetails;
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = "";

    captures.forEach((captura, idx) => {
      const card = document.createElement('div');
      // Sorteia 30% dos cards para serem holo e 20% para serem fullart
      const isHolo = Math.random() < 0.3;
      const isFullArt = Math.random() < 0.3;

      card.className = 'card' + (isHolo ? ' holo' : '') + (isFullArt ? ' fullart' : '');

      const imageUrl = captura.file_url || captura.preview_url || '';

      if (isFullArt) {
        card.style.backgroundImage = `url('${imageUrl}')`;
      }

      card.innerHTML = `
      <button class="print-button" title="Baixar Card como Imagem">📸</button>
      <h3>${captura.app_name || 'Nome do jogo'}</h3>
        <img src="${imageUrl}" alt="">
        <div class="info-screen">
          
          <p>${captura.short_description || 'Sem descrição.'}</p>
        </div>
      `;

      // Evento para o botão de "imprimir"
      const printButton = card.querySelector('.print-button');
      printButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o modal do card seja aberto

        // Salva o estado original do card para restaurar depois
        const originalTransform = card.style.transform;
        const wasHolo = card.classList.contains('holo');

        // Remove temporariamente os estilos que causam problemas na captura
        card.style.transform = '';
        card.classList.remove('is-tilting');
        card.classList.remove('holo'); // Remove o efeito holo para a captura
        card.classList.add('capturing'); // Esconde o botão de imprimir via CSS

        html2canvas(card, {
          useCORS: true, // Necessário para imagens de outros domínios
          backgroundColor: null, // Mantém o fundo transparente se houver
          scale: 2 // Aumenta a escala para melhorar a qualidade e corrigir artefatos
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = `${captura.app_name || 'card'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }).catch(err => {
          console.error('Erro ao gerar a imagem do card:', err);
          alert('Não foi possível gerar a imagem do card.');
        }).finally(() => {
          // Restaura o estado original do card após a captura
          card.style.transform = originalTransform;
          if (originalTransform) {
            card.classList.add('is-tilting');
          }
          if (wasHolo) {
            card.classList.add('holo');
          }
          card.classList.remove('capturing');
        });
      });

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
        document.getElementById('modalImagem').src = imageUrl;
        document.getElementById('modalTitulo').textContent = captura.app_name || 'Nome do jogo';
        document.getElementById('modalDescricao').textContent = captura.short_description || 'Sem descrição.';

        // Adiciona ou remove a classe holo no card ampliado conforme o card clicado
        const modalCard = document.querySelector('.card-ampliada');
        modalCard.classList.toggle('holo', isHolo);

        // Garante que o modal nunca seja fullart, para a imagem aparecer normalmente
        modalCard.classList.remove('fullart');
        modalCard.style.backgroundImage = '';

        document.getElementById('card-modal').style.display = 'flex';
      });
      cardsContainer.appendChild(card);
    });
  }

  // --- Manipuladores de evento do Modal ---

  const modalCard = document.querySelector('.card-ampliada');

  // Efeito tilt para o card ampliado
  if (modalCard) {
    modalCard.addEventListener('mousemove', e => {
      const rect = modalCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateX = ((y - midY) / midY) * 10;
      const rotateY = ((x - midX) / midX) * 10;
      modalCard.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
      modalCard.classList.add('is-tilting');
    });

    modalCard.addEventListener('mouseleave', () => {
      modalCard.style.transform = '';
      modalCard.classList.remove('is-tilting');
    });
  }

  // Abrir a imagem em uma nova aba ao clicar no card ampliado
  if (modalCard) {
    modalCard.onclick = (e) => {
      // Impede que a imagem seja aberta se o clique for no botão de fechar.
      // O evento de clique do próprio botão cuidará de fechar o modal.
      if (e.target.closest('#fecharModal')) {
        return;
      }

      const imageUrl = document.getElementById('modalImagem').src;
      if (imageUrl) {
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
      }
    };
  }

  // Função para fechar o modal e resetar o estado do card ampliado
  function fecharEresetarModal () {
    document.getElementById('card-modal').style.display = 'none'
    if (modalCard) {
      modalCard.style.transform = ''
      modalCard.classList.remove('is-tilting')
    }
  }

  // Fechar modal
  const fecharBtn = document.getElementById('fecharModal');
  if (fecharBtn) {
    fecharBtn.onclick = fecharEresetarModal;
  }

  // Fechar modal ao clicar fora do card
  document.getElementById('card-modal').onclick = function(e) {
    if (e.target === this) {
      fecharEresetarModal();
    }
  };
}

preencherCards();
