

let steamid = "";
let url = "";

function preencherCardTreinador(player) {
  const card = document.getElementById('cardTreinador');
  if (!card) return;
  card.querySelector('h2').textContent = player.personaname || 'Treinador';
  const img = card.querySelector('img');
  img.src = player.avatarfull || '';
  img.alt = player.personaname || 'Avatar';
  let bio = '';
  if (player.profileurl) {
    bio += `<a href="${player.profileurl}" target="_blank">Perfil Steam</a> <br>`;
  }
  if (player.personastate !== undefined) {
    const estados = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to trade', 'Looking to play'];
    bio += `<b>Status:</b> ${estados[player.personastate] || 'Desconhecido'}`;
  }
  if (!bio) {
    bio = player.personaname ? `Nickname: ${player.personaname}` : 'Sem descrição.';
  }
  card.querySelector('p').innerHTML = bio;
}

async function buscarEPreencherCardTreinador() {
  if (!steamid) return;
  try {
    const res = await fetch(`/api/screenshots/${steamid}?type=user`);
    const data = await res.json();
    if (data.response && data.response.players && data.response.players.length > 0) {
      preencherCardTreinador(data.response.players[0]);
    } else {
      preencherCardTreinador({});
    }
  } catch (err) {
    console.error("Erro ao buscar dados do usuário Steam:", err);
    preencherCardTreinador({});
  }
}

// Estado dos filtros de efeito
let effectMode = 'padrao'; // 'padrao', 'holo', 'fullart', 'nenhum'

//checkboxes
window.addEventListener('DOMContentLoaded', () => {
 
  const cbHolo = document.getElementById('cb-holo');
  const cbFullArt = document.getElementById('cb-fullart');
  const cbPadrao = document.getElementById('cb-padrao');
  if (cbHolo && cbFullArt && cbPadrao) {
    function updateEffectMode() {
      if (cbPadrao.checked) {
        cbHolo.checked = false;
        cbFullArt.checked = false;
      }
      preencherCards();
    }
    cbHolo.addEventListener('change', updateEffectMode);
    cbFullArt.addEventListener('change', updateEffectMode);
    cbPadrao.addEventListener('change', updateEffectMode);
  }
});

function setSteamIdAndReload(newId) {
  steamid = newId;
  url = `/api/screenshots/${steamid}`;
  preencherCarrossel();
  setQuadrados();
  preencherCards();
  buscarEPreencherCardTreinador();
}

// Modal SteamID
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('steamid-modal');
  const input = document.getElementById('input-steamid');
  const btn = document.getElementById('btn-buscar-steamid');
  if (modal && input && btn) {
    btn.onclick = () => {
      const val = input.value.trim();
      if (/^\d{17}$/.test(val)) {
        setSteamIdAndReload(val);
        modal.style.display = 'none';
      } else {
        input.style.border = '2px solid #f44';
        input.focus();
      }
    };
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') btn.click();
    });
    setTimeout(() => input.focus(), 100);
  }
});

if (steamid) {
  url = `/api/screenshots/${steamid}`;
  preencherCarrossel();
  setQuadrados();
  preencherCards();
  buscarEPreencherCardTreinador();
}



async function preencherCarrossel() {
  const res = await fetch(url);
  const data = await res.json();

  if (data.response && data.response.publishedfiledetails.length > 0) {
    const captures = data.response.publishedfiledetails;
    for (let i = 0; i < 8; i += 2) {
      const imgLeft = document.getElementById(`capturaLivro${i+1}`);
      const tituloLeft = document.getElementById(`tituloJogo${i+1}`);
      const descLeft = document.getElementById(`descricaoJogo${i+1}`);

      if (imgLeft && captures[i]) {
        imgLeft.src = captures[i].file_url || captures[i].preview_url || "";
        tituloLeft.textContent = captures[i].app_name || "Nome do jogo";
        descLeft.textContent = captures[i].short_description || "Sem descrição.";
      }

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

// ------------------------------

async function setQuadrados() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.response && data.response.publishedfiledetails.length > 0) {
      const captures = data.response.publishedfiledetails;

      const quadrados = ['.quadrado3', '.quadrado2', '.quadrado1'];

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

// ------------------------------

// Chame após preencherCards

async function preencherCards() {
  const res = await fetch(url);
  const data = await res.json();

  if (data.response && data.response.publishedfiledetails.length > 0) {
    const captures = data.response.publishedfiledetails;
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = "";

    const cbHolo = document.getElementById('cb-holo');
    const cbFullArt = document.getElementById('cb-fullart');
    const cbPadrao = document.getElementById('cb-padrao');

    captures.forEach((captura, idx) => {
      const card = document.createElement('div');
      let isHolo = false;
      let isFullArt = false;
      if (cbPadrao && cbPadrao.checked) {
        isHolo = Math.random() < 0.4;
        isFullArt = Math.random() < 0.4;
      } else {
        isHolo = cbHolo && cbHolo.checked;
        isFullArt = cbFullArt && cbFullArt.checked;
      }

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
        e.stopPropagation(); 

        const originalTransform = card.style.transform;
        const wasHolo = card.classList.contains('holo');

        card.style.transform = '';
        card.classList.remove('is-tilting');
        card.classList.add('capturing'); 

        let holoOverlay = null;
        if (wasHolo) {
          holoOverlay = document.createElement('div');
          holoOverlay.className = 'holo-static-overlay';
          holoOverlay.style.position = 'absolute';
          holoOverlay.style.inset = '0';
          holoOverlay.style.pointerEvents = 'none';
          holoOverlay.style.zIndex = '3';
          holoOverlay.style.opacity = '0.45';
          holoOverlay.style.background = 'linear-gradient(120deg, #fff4 0%, #fff8 50%, #fff2 100%), url("https://assets.codepen.io/13471/holo.png")';
          holoOverlay.style.backgroundBlendMode = 'lighten, screen';
          holoOverlay.style.backgroundSize = '180%, 180%';
          holoOverlay.style.backgroundPosition = 'center';
          card.appendChild(holoOverlay);
        }

        html2canvas(card, {
          useCORS: true,
          backgroundColor: null, 
          scale: 2 
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = `${captura.app_name || 'card'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }).catch(err => {
          console.error('Erro ao gerar a imagem do card:', err);
          alert('Não foi possível gerar a imagem do card.');
        }).finally(() => {
          if (holoOverlay) card.removeChild(holoOverlay);
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
      card.addEventListener('click', () => {
        document.getElementById('modalImagem').src = imageUrl;
        document.getElementById('modalTitulo').textContent = captura.app_name || 'Nome do jogo';
        document.getElementById('modalDescricao').textContent = captura.short_description || 'Sem descrição.';

        const modalCard = document.querySelector('.card-ampliada');
        modalCard.classList.toggle('holo', isHolo);

        modalCard.classList.remove('fullart');
        modalCard.style.backgroundImage = '';

        document.getElementById('card-modal').style.display = 'flex';
      });
      cardsContainer.appendChild(card);
    });
  }


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
      if (e.target.closest('#fecharModal')) {
        return;
      }

      const imageUrl = document.getElementById('modalImagem').src;
      if (imageUrl) {
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
      }
    };
  }

  function fecharEresetarModal () {
    document.getElementById('card-modal').style.display = 'none'
    if (modalCard) {
      modalCard.style.transform = ''
      modalCard.classList.remove('is-tilting')
    }
  }

  const fecharBtn = document.getElementById('fecharModal');
  if (fecharBtn) {
    fecharBtn.onclick = fecharEresetarModal;
  }

  document.getElementById('card-modal').onclick = function(e) {
    if (e.target === this) {
      fecharEresetarModal();
    }
  };
}

preencherCards();

