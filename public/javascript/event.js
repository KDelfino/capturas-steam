let steamid = "";
let url = "";
let allCaptures = []; // Armazena todas as capturas carregadas
let activeCardData = null; // Card sendo editado no modal
let activeCardIndex = null;

// ==========================================================================
// Mapeamento de Tipos, HP e Ataques por Jogo (Banco de Dados Local)
// ==========================================================================
const ELEMENT_MAPPING = {
  fogo: { type: "fogo", colorVar: "--color-fogo", weak: "agua", resist: "metal" },
  agua: { type: "agua", colorVar: "--color-agua", weak: "raio", resist: "fogo" },
  grama: { type: "grama", colorVar: "--color-grama", weak: "fogo", resist: "agua" },
  raio: { type: "raio", colorVar: "--color-raio", weak: "metal", resist: "psiquico" },
  psiquico: { type: "psiquico", colorVar: "--color-psiquico", weak: "sombrio", resist: "incolor" },
  metal: { type: "metal", colorVar: "--color-metal", weak: "fogo", resist: "grama" },
  sombrio: { type: "sombrio", colorVar: "--color-sombrio", weak: "fogo", resist: "psiquico" },
  dragao: { type: "dragao", colorVar: "--color-dragao", weak: "psiquico", resist: "raio" },
  incolor: { type: "incolor", colorVar: "--color-incolor", weak: "sombrio", resist: "metal" }
};

// Gerador de Vetores SVG de Alta Qualidade para os Tipos Pokémon (CDNs de imagens substituídas por vetores limpos)
function getEnergyIcon(type, size = 22) {
  const SVGS = {
    fogo: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#ef4444"/><path d="M12 4s-1 2.5-3 3.5c-1.5.8-2 2-2 3.5 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2-1.5-3.5-2.5-4.5C13.5 5.5 12 4 12 4z" fill="#fff"/></svg>`,
    agua: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#3b82f6"/><path d="M12 4s-5 5.5-5 8.5c0 2.8 2.2 5 5 5s5-2.2 5-5c0-3-5-8.5-5-8.5z" fill="#fff"/></svg>`,
    grama: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#22c55e"/><path d="M12 4c-3.3 0-6 2.7-6 6 0 3 4 8 6 10 2-2 6-7 6-10 0-3.3-2.7-6-6-6zm-1 9c-1.7 0-3-1.3-3-3s1.3-3 3-3V13z" fill="#fff"/></svg>`,
    raio: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#eab308"/><path d="M13 3l-6 9h5v9l6-9h-5z" fill="#fff"/></svg>`,
    psiquico: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#a855f7"/><circle cx="12" cy="12" r="5" fill="#fff"/><circle cx="12" cy="12" r="2.5" fill="#a855f7"/></svg>`,
    metal: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#64748b"/><path d="M12 8a4 4 0 100 8 4 4 0 000-8z" fill="#fff"/></svg>`,
    sombrio: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#0f172a"/><path d="M10 5a7 7 0 007 7 7 7 0 01-7-7c0 3.9-3.3 7-7 7a7 7 0 007-7z" fill="#fff"/></svg>`,
    dragao: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#f97316"/><path d="M12 5l-2 3-3-1 2 4-4 .5 4 2.5-2 3.5 4-1 1 3.5 1-3.5 4 1-2-3.5 4-2.5-4-.5 2-4-3 1z" fill="#fff"/></svg>`,
    incolor: `<svg class="energy-svg" style="width: ${size}px; height: ${size}px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#cbd5e1"/><path d="M12 6.5l1.6 3.2 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#71717a"/></svg>`
  };
  return SVGS[type] || SVGS.incolor;
}

function getGameCardTemplate(appName) {
  const name = (appName || "").toLowerCase();
  
  if (name.includes("elden ring") || name.includes("souls") || name.includes("bloodborne") || name.includes("sekiro")) {
    return {
      type: "sombrio",
      hp: 200,
      atk1Name: "Desvio Preciso",
      atk1Desc: "Evita todo o dano recebido no próximo turno rolando freneticamente.",
      atk1Dmg: "0",
      atk2Name: "Você Morreu",
      atk2Desc: "Causa dano massivo, mas faz você perder a paciência.",
      atk2Dmg: "180"
    };
  }
  if (name.includes("cyberpunk") || name.includes("ghostrunner") || name.includes("watch dogs")) {
    return {
      type: "raio",
      hp: 140,
      atk1Name: "Sandevistan",
      atk1Desc: "Desacelera o tempo. Permite atacar duas vezes no próximo turno.",
      atk1Dmg: "40",
      atk2Name: "Lâminas Linces",
      atk2Desc: "Ataque cibernético rápido e letal.",
      atk2Dmg: "90"
    };
  }
  if (name.includes("subnautica") || name.includes("dave the diver") || name.includes("sea of thieves") || name.includes("raft") || name.includes("abzu")) {
    return {
      type: "agua",
      hp: 130,
      atk1Name: "Arpoada",
      atk1Desc: "Pesca rápida que causa dano e garante suprimento de oxigênio.",
      atk1Dmg: "30",
      atk2Name: "Leviatã Ataca",
      atk2Desc: "Invoca um ceifador das profundezas para assustar o oponente.",
      atk2Dmg: "120"
    };
  }
  if (name.includes("stardew") || name.includes("minecraft") || name.includes("terraria") || name.includes("animal crossing") || name.includes("sims") || name.includes("grow")) {
    return {
      type: "grama",
      hp: 120,
      atk1Name: "Cultivar Nabos",
      atk1Desc: "Restaura 30 de HP deste card no final do seu turno.",
      atk1Dmg: "10",
      atk2Name: "Golpe de Picareta",
      atk2Desc: "Minera minérios raros na cabeça do oponente.",
      atk2Dmg: "60"
    };
  }
  if (name.includes("portal") || name.includes("half-life") || name.includes("control") || name.includes("death stranding")) {
    return {
      type: "psiquico",
      hp: 130,
      atk1Name: "Portal Loop",
      atk1Desc: "Faz o inimigo cair infinitamente do teto, deixando-o confuso.",
      atk1Dmg: "30",
      atk2Name: "Arma de Gravidade",
      atk2Desc: "Lança um objeto pesado do cenário diretamente no oponente.",
      atk2Dmg: "80"
    };
  }
  if (name.includes("factorio") || name.includes("satisfactory") || name.includes("space engineers") || name.includes("rust") || name.includes("civilization") || name.includes("cities")) {
    return {
      type: "metal",
      hp: 160,
      atk1Name: "Automação",
      atk1Desc: "Aumenta o dano de todos os ataques metálicos em 20 no próximo turno.",
      atk1Dmg: "20",
      atk2Name: "Produção em Massa",
      atk2Desc: "Lança uma esteira cheia de polias e engrenagens.",
      atk2Dmg: "80"
    };
  }
  if (name.includes("counter-strike") || name.includes("cs:") || name.includes("csgo") || name.includes("apex") || name.includes("valorant") || name.includes("fortnite") || name.includes("pubg") || name.includes("overwatch") || name.includes("rainbow six") || name.includes("siege")) {
    return {
      type: "fogo",
      hp: 150,
      atk1Name: "Granada de Luz",
      atk1Desc: "Cega o oponente. O próximo ataque dele tem 50% de chance de errar.",
      atk1Dmg: "20",
      atk2Name: "Tiro na Cabeça",
      atk2Desc: "Um tiro preciso que elimina qualquer barreira.",
      atk2Dmg: "130"
    };
  }
  if (name.includes("hollow knight") || name.includes("resident evil") || name.includes("outlast") || name.includes("phasmophobia") || name.includes("dead by daylight") || name.includes("limbo") || name.includes("inside")) {
    return {
      type: "sombrio",
      hp: 130,
      atk1Name: "Foco de Alma",
      atk1Desc: "Consome energia para curar 40 de HP.",
      atk1Dmg: "0",
      atk2Name: "Corte de Ferrão",
      atk2Desc: "Um golpe de espada rápido imbuído de sombra.",
      atk2Dmg: "70"
    };
  }
  if (name.includes("witcher") || name.includes("skyrim") || name.includes("dragon age") || name.includes("monster hunter")) {
    return {
      type: "dragao",
      hp: 170,
      atk1Name: "Sinal de Igni",
      atk1Desc: "Causa queimadura que consome 10 de HP por turno.",
      atk1Dmg: "40",
      atk2Name: "Fus Ro Dah",
      atk2Desc: "Grito lendário que joga o oponente para trás.",
      atk2Dmg: "100"
    };
  }

  // Padrão Incolor para outros jogos
  return {
    type: "incolor",
    hp: 120,
    atk1Name: "Salvar Jogo",
    atk1Desc: "Previne derrota no próximo turno se o HP estiver abaixo de 20.",
    atk1Dmg: "10",
    atk2Name: "Fúria do Controle",
    atk2Desc: "Ataque desesperado por errar um combo simples.",
    atk2Dmg: "50"
  };
}

// Generador de Dados Completos do Card
function generateCardData(captura, index) {
  const gameTemplate = getGameCardTemplate(captura.app_name);
  const imageUrl = captura.file_url || captura.preview_url || '';
  
  return {
    index: index,
    appName: captura.app_name || 'Nome do Jogo',
    imageUrl: imageUrl,
    description: captura.short_description || 'Sem descrição.',
    type: gameTemplate.type,
    hp: gameTemplate.hp,
    atk1Name: gameTemplate.atk1Name,
    atk1Desc: gameTemplate.atk1Desc,
    atk1Dmg: gameTemplate.atk1Dmg,
    atk2Name: gameTemplate.atk2Name,
    atk2Desc: gameTemplate.atk2Desc,
    atk2Dmg: gameTemplate.atk2Dmg,
    isHolo: false,
    isFullArt: false
  };
}

// ==========================================================================
// Preenchimento do Trainer Card & Conquistas (Badges)
// ==========================================================================
function preencherCardTreinador(player, cardCount) {
  const nameEl = document.getElementById('trainer-name');
  const avatarEl = document.getElementById('trainer-avatar');
  const steamIdEl = document.getElementById('trainer-steam-id');
  const statusEl = document.getElementById('trainer-status');
  const cardCountEl = document.getElementById('trainer-card-count');

  if (nameEl) nameEl.textContent = player.personaname || 'Treinador';
  if (avatarEl && player.avatarfull) avatarEl.src = player.avatarfull;
  if (steamIdEl) steamIdEl.textContent = `ID: ${player.steamid || '-----------------'}`;
  if (cardCountEl) cardCountEl.textContent = cardCount || 0;

  if (statusEl) {
    const estados = ['Offline', 'Online', 'Ocupado', 'Ausente', 'Soneca', 'Querendo trocar', 'Querendo jogar'];
    const statusText = estados[player.personastate] || 'Desconhecido';
    const statusDot = statusEl.querySelector('.status-dot');
    
    statusEl.innerHTML = '';
    const newDot = document.createElement('span');
    newDot.className = 'status-dot';
    if (player.personastate !== undefined && player.personastate > 0) {
      newDot.classList.add('online');
    }
    statusEl.appendChild(newDot);
    statusEl.appendChild(document.createTextNode(` ${statusText}`));
  }

  // Atualizar Badges baseadas na quantidade de screenshots
  const badges = document.querySelectorAll('.trainer-badges .badge');
  badges.forEach((badge, index) => {
    let required = 1;
    switch (index) {
      case 0: required = 1; break;  // ⚔️
      case 1: required = 3; break;  // 🛡️
      case 2: required = 5; break;  // 🔥
      case 3: required = 10; break; // 💧
      case 4: required = 15; break; // ⚡
      case 5: required = 20; break; // 🌿
      case 6: required = 30; break; // 🔮
      case 7: required = 50; break; // ✨
    }
    
    if (cardCount >= required) {
      badge.classList.remove('locked');
      badge.classList.add('active');
    } else {
      badge.classList.add('locked');
      badge.classList.remove('active');
    }
  });
}

async function buscarEPreencherCardTreinador(cardCount) {
  if (!steamid) return;
  try {
    const res = await fetch(`/api/screenshots/${steamid}?type=user`);
    const data = await res.json();
    if (data.response && data.response.players && data.response.players.length > 0) {
      preencherCardTreinador(data.response.players[0], cardCount);
    } else {
      preencherCardTreinador({}, cardCount);
    }
  } catch (err) {
    console.error("Erro ao buscar dados do usuário Steam:", err);
    preencherCardTreinador({}, cardCount);
  }
}

// ==========================================================================
// Efeito de Rotação 3D (Tilt) & Holografia Móvel
// ==========================================================================
function addTiltEffect(cardElement) {
  cardElement.addEventListener('mousemove', e => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateX = ((y - midY) / midY) * 12;
    const rotateY = ((x - midX) / midX) * 12;
    
    cardElement.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    cardElement.classList.add('is-tilting');

    // Mover o gradiente holo com base na posição do mouse
    if (cardElement.classList.contains('holo')) {
      const sparkles = cardElement.querySelector('.card::after') || cardElement;
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      cardElement.style.setProperty('--holo-x', `${pctX}%`);
      cardElement.style.setProperty('--holo-y', `${pctY}%`);
    }
  });

  cardElement.addEventListener('mouseleave', () => {
    cardElement.style.transform = '';
    cardElement.classList.remove('is-tilting');
  });
}

// ==========================================================================
// Geração do HTML do Card
// ==========================================================================
function createCardHTML(cardData, forceHolo = null, forceFullArt = null) {
  const isHolo = forceHolo !== null ? forceHolo : cardData.isHolo;
  const isFullArt = forceFullArt !== null ? forceFullArt : cardData.isFullArt;
  
  const element = ELEMENT_MAPPING[cardData.type] || ELEMENT_MAPPING.incolor;
  const cardClass = `card type-${cardData.type}` + (isHolo ? ' holo' : '') + (isFullArt ? ' fullart' : '');
  
  let costIcons1 = '';
  let costIcons2 = '';

  // Gerar custo em SVGs
  const costCount1 = cardData.atk1Dmg === "0" ? 1 : 2;
  const costCount2 = Math.min(4, Math.max(2, Math.ceil(parseInt(cardData.atk2Dmg || 50) / 40)));
  
  for (let i = 0; i < costCount1; i++) {
    costIcons1 += getEnergyIcon(cardData.type, 18);
  }
  for (let i = 0; i < costCount2; i++) {
    costIcons2 += i === 0 ? getEnergyIcon(cardData.type, 18) : getEnergyIcon('incolor', 18);
  }

  // Estilo Inline de Fundo caso seja Full Art
  const inlineBg = isFullArt ? `style="background-image: url('${cardData.imageUrl}')"` : '';

  return `
    <div class="${cardClass}" data-index="${cardData.index}" ${inlineBg}>
      <button class="print-button" title="Baixar Card como Imagem">📸</button>
      
      <!-- Cabeçalho do Card -->
      <div class="card-header-row">
        <span class="card-title-text">${cardData.appName}</span>
        <div class="card-hp-area">
          <span class="hp-label">HP</span>
          <span class="hp-num">${cardData.hp}</span>
          ${getEnergyIcon(cardData.type, 22)}
        </div>
      </div>

      <!-- Moldura da Screenshot -->
      <div class="card-image-frame">
        <img src="${cardData.imageUrl}" alt="${cardData.appName}" crossorigin="anonymous">
      </div>
      <div class="card-image-footer">
        Nº ${100 + parseInt(cardData.index)} TCG Capture - Tipo: ${cardData.type.toUpperCase()}
      </div>

      <!-- Área de Ataques -->
      <div class="card-attacks-area">
        <!-- Ataque 1 -->
        <div class="card-attack">
          <div class="attack-cost">${costIcons1}</div>
          <div class="attack-info">
            <div class="attack-name-row">
              <span class="attack-name">${cardData.atk1Name}</span>
              <span class="attack-dmg">${cardData.atk1Dmg}</span>
            </div>
            <div class="attack-desc">${cardData.atk1Desc}</div>
          </div>
        </div>

        <!-- Ataque 2 -->
        <div class="card-attack">
          <div class="attack-cost">${costIcons2}</div>
          <div class="attack-info">
            <div class="attack-name-row">
              <span class="attack-name">${cardData.atk2Name}</span>
              <span class="attack-dmg">${cardData.atk2Dmg}</span>
            </div>
            <div class="attack-desc">${cardData.atk2Desc}</div>
          </div>
        </div>
      </div>

      <!-- Rodapé de Descrição / Legenda -->
      <div class="card-description-footer">
        ${cardData.description}
      </div>

      <!-- Rodapé Técnico -->
      <div class="card-weak-resist-row">
        <span style="display: flex; align-items: center; gap: 3px;">Fraqueza: ${getEnergyIcon(element.weak, 14)} x2</span>
        <span style="display: flex; align-items: center; gap: 3px;">Resistência: ${getEnergyIcon(element.resist, 14)} -30</span>
        <span style="display: flex; align-items: center; gap: 3px;">Recuo: ${getEnergyIcon('incolor', 14)} ${getEnergyIcon('incolor', 14)}</span>
      </div>
    </div>
  `;
}

// ==========================================================================
// Renderização da Pilha de Destaques
// ==========================================================================
function setQuadrados() {
  const quadrados = ['.quadrado3', '.quadrado2', '.quadrado1'];
  quadrados.forEach((classe, index) => {
    const el = document.querySelector(classe);
    if (el && allCaptures[index]) {
      el.style.backgroundImage = `url('${allCaptures[index].imageUrl}')`;
    }
  });
}

// ==========================================================================
// Renderização dos Filtros Dinâmicos no Painel de Controle
// ==========================================================================
function preencherFiltroJogos() {
  const select = document.getElementById('filter-game');
  if (!select) return;

  // Pegar jogos únicos
  const jogos = ['all', ...new Set(allCaptures.map(c => c.appName))];
  
  select.innerHTML = '';
  jogos.forEach(jogo => {
    const opt = document.createElement('option');
    opt.value = jogo;
    opt.textContent = jogo === 'all' ? 'Todos os Jogos' : jogo;
    select.appendChild(opt);
  });
}

// ==========================================================================
// Renderização da Galeria de Cards Filtrados
// ==========================================================================
function renderCardsList() {
  const cardsContainer = document.getElementById('cards');
  if (!cardsContainer) return;
  cardsContainer.innerHTML = "";

  const cbHolo = document.getElementById('cb-holo');
  const cbFullArt = document.getElementById('cb-fullart');
  const cbPadrao = document.getElementById('cb-padrao');
  const filterGame = document.getElementById('filter-game')?.value || 'all';
  const searchQuery = (document.getElementById('search-cards')?.value || '').toLowerCase().trim();

  // Filtragem
  const filtered = allCaptures.filter(card => {
    const matchesGame = filterGame === 'all' || card.appName === filterGame;
    const matchesSearch = card.appName.toLowerCase().includes(searchQuery) || 
                          card.description.toLowerCase().includes(searchQuery);
    return matchesGame && matchesSearch;
  });

  filtered.forEach(cardData => {
    // Determinar efeitos Holo/FullArt
    let isHolo = cardData.isHolo;
    let isFullArt = cardData.isFullArt;

    if (cbPadrao && cbPadrao.checked) {
      // Usa as configurações salvas de cada card ou aleatórias iniciais
    } else {
      isHolo = cbHolo && cbHolo.checked;
      isFullArt = cbFullArt && cbFullArt.checked;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createCardHTML(cardData, isHolo, isFullArt).trim();
    const cardElement = tempDiv.firstChild;

    // Configurar interações
    addTiltEffect(cardElement);

    // Clique para abrir o Personalizador
    cardElement.addEventListener('click', (e) => {
      if (e.target.closest('.print-button')) return; // Ignora se clicou no baixar rápido
      abrirPersonalizador(cardData.index);
    });

    // Clique no botão de exportar rápido do card
    const printButton = cardElement.querySelector('.print-button');
    if (printButton) {
      printButton.addEventListener('click', (e) => {
        e.stopPropagation();
        exportCardImage(cardElement, cardData.appName);
      });
    }

    cardsContainer.appendChild(cardElement);
  });
}

// ==========================================================================
// Exportar Card como Imagem usando html2canvas
// ==========================================================================
function exportCardImage(cardElement, filename) {
  const originalTransform = cardElement.style.transform;
  const wasHolo = cardElement.classList.contains('holo');

  cardElement.style.transform = '';
  cardElement.classList.remove('is-tilting');
  cardElement.classList.add('capturing');

  let holoOverlay = null;
  if (wasHolo) {
    holoOverlay = document.createElement('div');
    holoOverlay.className = 'holo-static-overlay';
    cardElement.appendChild(holoOverlay);
  }

  // Forçar redimensionamento temporário para exportar com excelente qualidade
  html2canvas(cardElement, {
    useCORS: true,
    backgroundColor: null,
    scale: 2.5 // Aumenta a resolução do card exportado
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `${filename || 'card-steam'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    console.error('Erro ao gerar a imagem do card:', err);
    alert('Não foi possível gerar a imagem do card devido a restrições de carregamento de imagem da Steam (CORS).');
  }).finally(() => {
    if (holoOverlay) cardElement.removeChild(holoOverlay);
    cardElement.style.transform = originalTransform;
    if (originalTransform) {
      cardElement.classList.add('is-tilting');
    }
    cardElement.classList.remove('capturing');
  });
}

// ==========================================================================
// Modal do Personalizador (Card Customizer)
// ==========================================================================
function abrirPersonalizador(index) {
  activeCardIndex = index;
  activeCardData = { ...allCaptures[index] }; // Cópia dos dados
  
  const modal = document.getElementById('card-modal');
  if (!modal) return;

  // Preencher campos do editor
  document.getElementById('edit-titulo').value = activeCardData.appName;
  document.getElementById('edit-tipo').value = activeCardData.type;
  document.getElementById('edit-hp').value = activeCardData.hp;
  document.getElementById('edit-descricao').value = activeCardData.description;
  document.getElementById('edit-atk1-nome').value = activeCardData.atk1Name;
  document.getElementById('edit-atk1-dmg').value = activeCardData.atk1Dmg;
  document.getElementById('edit-atk2-nome').value = activeCardData.atk2Name;
  document.getElementById('edit-atk2-dmg').value = activeCardData.atk2Dmg;
  
  document.getElementById('edit-holo').checked = activeCardData.isHolo;
  document.getElementById('edit-fullart').checked = activeCardData.isFullArt;

  // Atualizar preview
  atualizarPreviewModal();

  modal.style.display = 'flex';
}

function fecharPersonalizador() {
  const modal = document.getElementById('card-modal');
  if (modal) modal.style.display = 'none';
  activeCardData = null;
  activeCardIndex = null;
}

function atualizarPreviewModal() {
  const container = document.getElementById('modalCardPreviewContainer');
  if (!container || !activeCardData) return;

  container.innerHTML = "";
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = createCardHTML(activeCardData, activeCardData.isHolo, activeCardData.isFullArt).trim();
  const previewElement = tempDiv.firstChild;
  previewElement.id = "previewCard";
  previewElement.classList.add('card-ampliada');

  addTiltEffect(previewElement);

  // Permite abrir a imagem original limpa em uma nova aba ao clicar no card ampliado
  previewElement.addEventListener('click', (e) => {
    if (e.target.closest('.print-button')) return;
    window.open(activeCardData.imageUrl, '_blank', 'noopener,noreferrer');
  });

  container.appendChild(previewElement);
}

// Escutar alterações nos campos de edição
function setupEditorListeners() {
  const inputs = [
    { id: 'edit-titulo', prop: 'appName' },
    { id: 'edit-tipo', prop: 'type' },
    { id: 'edit-hp', prop: 'hp' },
    { id: 'edit-descricao', prop: 'description' },
    { id: 'edit-atk1-nome', prop: 'atk1Name' },
    { id: 'edit-atk1-dmg', prop: 'atk1Dmg' },
    { id: 'edit-atk2-nome', prop: 'atk2Name' },
    { id: 'edit-atk2-dmg', prop: 'atk2Dmg' }
  ];

  inputs.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      el.addEventListener('input', (e) => {
        if (!activeCardData) return;
        activeCardData[item.prop] = e.target.value;
        atualizarPreviewModal();
      });
    }
  });

  // Toggles de efeito
  const toggleHolo = document.getElementById('edit-holo');
  if (toggleHolo) {
    toggleHolo.addEventListener('change', (e) => {
      if (!activeCardData) return;
      activeCardData.isHolo = e.target.checked;
      atualizarPreviewModal();
    });
  }

  const toggleFullArt = document.getElementById('edit-fullart');
  if (toggleFullArt) {
    toggleFullArt.addEventListener('change', (e) => {
      if (!activeCardData) return;
      activeCardData.isFullArt = e.target.checked;
      atualizarPreviewModal();
    });
  }

  // Ação de exportar do editor
  const exportBtn = document.getElementById('btn-export-card');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const previewCard = document.getElementById('previewCard');
      if (previewCard && activeCardData) {
        // Salva os dados editados de volta no banco de dados local para manter alterado na tela principal
        allCaptures[activeCardIndex] = { ...activeCardData };
        renderCardsList(); // Atualiza a galeria principal
        exportCardImage(previewCard, activeCardData.appName);
      }
    };
  }

  // Ação de abrir imagem original do editor
  const openOriginalBtn = document.getElementById('btn-open-original');
  if (openOriginalBtn) {
    openOriginalBtn.onclick = () => {
      if (activeCardData && activeCardData.imageUrl) {
        window.open(activeCardData.imageUrl, '_blank', 'noopener,noreferrer');
      }
    };
  }
}

// ==========================================================================
// Carregar dados gerais da Steam
// ==========================================================================
async function carregarDadosCompletosSteam() {
  if (!steamid) return;
  url = `/api/screenshots/${steamid}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.response && data.response.publishedfiledetails && data.response.publishedfiledetails.length > 0) {
      const captures = data.response.publishedfiledetails;
      
      // Mapear capturas do JSON para o formato do Card Data
      allCaptures = captures.map((captura, index) => {
        const card = generateCardData(captura, index);
        // Distribuir holo/fullart de forma aleatória inicial
        card.isHolo = Math.random() < 0.35;
        card.isFullArt = Math.random() < 0.25;
        return card;
      });

      // Configurar tela
      setQuadrados();
      preencherFiltroJogos();
      renderCardsList();
      buscarEPreencherCardTreinador(allCaptures.length);
    } else {
      document.getElementById('cards').innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-muted);'>Nenhuma captura encontrada para este SteamID.</p>";
      preencherCardTreinador({}, 0);
    }
  } catch (err) {
    console.error("Erro ao carregar capturas da Steam:", err);
    document.getElementById('cards').innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #ff5f56;'>Erro ao buscar capturas da Steam. Verifique sua conexão e tente novamente.</p>";
  }
}

function setSteamIdAndReload(newId) {
  steamid = newId;
  carregarDadosCompletosSteam();
}

// ==========================================================================
// Eventos DOMContentLoaded / Configuração Inicial
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Modal SteamID Inicial
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
        input.style.border = '2px solid #ff5f56';
        input.focus();
      }
    };
    
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') btn.click();
    });
    
    setTimeout(() => input.focus(), 200);
  }

  // Configurar Filtros Globais de Efeitos
  const cbHolo = document.getElementById('cb-holo');
  const cbFullArt = document.getElementById('cb-fullart');
  const cbPadrao = document.getElementById('cb-padrao');
  
  if (cbHolo && cbFullArt && cbPadrao) {
    cbHolo.addEventListener('change', renderCardsList);
    cbFullArt.addEventListener('change', renderCardsList);
    cbPadrao.addEventListener('change', renderCardsList);
  }

  // Configurar barra de pesquisa e filtro de jogo
  const searchInput = document.getElementById('search-cards');
  const gameFilter = document.getElementById('filter-game');
  
  if (searchInput) {
    searchInput.addEventListener('input', renderCardsList);
  }
  if (gameFilter) {
    gameFilter.addEventListener('change', renderCardsList);
  }

  // Fechar Modal do Editor
  const fecharBtn = document.getElementById('fecharModal');
  if (fecharBtn) {
    fecharBtn.onclick = fecharPersonalizador;
  }

  const cardModal = document.getElementById('card-modal');
  if (cardModal) {
    cardModal.onclick = function(e) {
      if (e.target === this) {
        fecharPersonalizador();
      }
    };
  }

  // Configurar listeners de inputs do editor
  setupEditorListeners();
});
