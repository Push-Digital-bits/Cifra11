// tema.js — sistema de tema (dia/noite), fonte e tamanho da letra pra tela de leitura de cifra (G11 Cifras)

const TEMA_OPCOES = {
  noite: { bg: '#000000', cores: { laranja: '#F97316', branco: '#FFFFFF' } },
  dia:   { bg: '#FFFFFF', cores: { preto: '#111111', azul: '#0F172A', laranja: '#F97316' } }
};

const FONTE_OPCOES = {
  plex:      { nome: 'Moderna',   familia: "'IBM Plex Mono', 'Courier New', monospace",  google: 'IBM+Plex+Mono:wght@400;700' },
  jetbrains: { nome: 'JetBrains', familia: "'JetBrains Mono', 'Courier New', monospace", google: 'JetBrains+Mono:wght@400;700' },
  roboto:    { nome: 'Roboto',    familia: "'Roboto Mono', 'Courier New', monospace",    google: 'Roboto+Mono:wght@400;700' },
  fira:      { nome: 'Fira',      familia: "'Fira Code', 'Courier New', monospace",      google: 'Fira+Code:wght@400;700' },
  classica:  { nome: 'Clássica',  familia: "'Courier New', Courier, monospace",          google: null }
};

const TAMANHO_MIN = 14;
const TAMANHO_MAX = 32;
const TAMANHO_PASSO = 2;

const TEMA_PADRAO = { modo: 'noite', cor: 'laranja', fonte: 'plex', tamanho: 22 };
const TEMA_CHAVE = 'temaCifra';

function obterTemaSalvo() {
  try {
    const bruto = localStorage.getItem(TEMA_CHAVE);
    if (!bruto) return { ...TEMA_PADRAO };
    const tema = JSON.parse(bruto);
    if (!TEMA_OPCOES[tema.modo] || !TEMA_OPCOES[tema.modo].cores[tema.cor]) return { ...TEMA_PADRAO };
    if (!FONTE_OPCOES[tema.fonte]) tema.fonte = TEMA_PADRAO.fonte;
    if (typeof tema.tamanho !== 'number' || tema.tamanho < TAMANHO_MIN || tema.tamanho > TAMANHO_MAX) tema.tamanho = TEMA_PADRAO.tamanho;
    return tema;
  } catch (e) {}
  return { ...TEMA_PADRAO };
}

function salvarTema(tema) {
  try { localStorage.setItem(TEMA_CHAVE, JSON.stringify(tema)); } catch (e) {}
}

function aplicarTemaNoElemento(elemento, tema) {
  const def = TEMA_OPCOES[tema.modo];
  elemento.style.setProperty('--tema-bg', def.bg);
  elemento.style.setProperty('--tema-texto', def.cores[tema.cor]);
  elemento.style.setProperty('--tema-borda', tema.modo === 'noite' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)');
  elemento.style.setProperty('--tema-fonte', FONTE_OPCOES[tema.fonte].familia);
  elemento.style.setProperty('--tema-tamanho', tema.tamanho + 'px');
}

function nomeCor(chave) {
  const nomes = { laranja: 'Laranja', branco: 'Branco', preto: 'Preto', azul: 'Azul marinho' };
  return nomes[chave] || chave;
}

function garantirFontesGoogle() {
  if (document.getElementById('temaCifraFontes')) return;
  const familias = Object.values(FONTE_OPCOES)
    .filter(f => f.google)
    .map(f => 'family=' + f.google)
    .join('&');
  if (!familias) return;
  const link = document.createElement('link');
  link.id = 'temaCifraFontes';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${familias}&display=swap`;
  document.head.appendChild(link);
}

// elementoAlvo: elemento que recebe as variáveis CSS --tema-bg/--tema-texto/--tema-borda/--tema-fonte/--tema-tamanho.
// opcoes.visivelDeInicio: se o botão flutuante começa visível (padrão: true).
function iniciarSeletorTema(elementoAlvo, opcoes = {}) {
  let tema = obterTemaSalvo();
  garantirFontesGoogle();
  aplicarTemaNoElemento(elementoAlvo, tema);

  if (!document.getElementById('temaCifraEstilo')) {
    const style = document.createElement('style');
    style.id = 'temaCifraEstilo';
    style.textContent = `
      #botaoTema {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: linear-gradient(145deg, #5B5B64, #2C2C32);
        color: #0F172A;
        font-size: 24px;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.55);
        border: 1px solid rgba(255,255,255,0.10);
        cursor: pointer;
        z-index: 1000;
        padding: 0;
        transition: top 0.2s ease;
      }
      body.avisoAtivo #botaoTema { top: 66px; }
      #painelTema {
        position: fixed;
        top: 84px;
        right: 20px;
        left: 20px;
        margin-left: auto;
        background: #16213A;
        border: 1px solid #2A3A5C;
        border-radius: 14px;
        padding: 14px;
        max-width: 290px;
        max-height: 75vh;
        overflow-y: auto;
        display: none;
        z-index: 1000;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        transition: top 0.2s ease;
      }
      body.avisoAtivo #painelTema { top: 130px; }
      #painelTema.aberto { display: block; }
      #painelTema .rotuloTema {
        font-size: 11px;
        font-weight: 700;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 10px 0 6px;
      }
      #painelTema .rotuloTema:first-child { margin-top: 0; }
      #painelTema .linhaOpcoesTema { display: flex; gap: 8px; flex-wrap: wrap; }
      #painelTema button.opcaoModo, #painelTema button.opcaoCor, #painelTema button.opcaoFonte {
        flex: 1;
        min-width: 64px;
        padding: 9px 6px;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid #2A3A5C;
        background: #0F172A;
        color: #E5E7EB;
        cursor: pointer;
        font-weight: 600;
      }
      #painelTema button.opcaoFonte { min-width: 84px; }
      #painelTema button.ativo {
        border-color: #F97316;
        box-shadow: 0 0 0 1px #F97316;
      }
      #painelTema button.opcaoCor .amostraCor {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 5px;
        vertical-align: middle;
        border: 1px solid rgba(255,255,255,0.3);
      }
      #painelTema .linhaTamanho {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #painelTema .linhaTamanho button {
        flex: 1;
        padding: 10px 6px;
        border-radius: 8px;
        border: 1px solid #2A3A5C;
        background: #0F172A;
        color: #E5E7EB;
        cursor: pointer;
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 2px;
      }
      #painelTema .linhaTamanho .valorTamanho {
        font-size: 12px;
        font-weight: 700;
        color: #94A3B8;
        min-width: 40px;
        text-align: center;
        flex-shrink: 0;
      }
      #painelTema .tMini { font-size: 12px; }
      #painelTema .tMaior { font-size: 20px; }
    `;
    document.head.appendChild(style);
  }

  const botao = document.createElement('button');
  botao.id = 'botaoTema';
  botao.textContent = '🎨';
  botao.setAttribute('aria-label', 'Mudar tema da letra');
  botao.style.display = opcoes.visivelDeInicio === false ? 'none' : 'flex';
  document.body.appendChild(botao);

  const painel = document.createElement('div');
  painel.id = 'painelTema';
  painel.addEventListener('click', (e) => e.stopPropagation());
  document.body.appendChild(painel);

  function ajustarTamanho(delta) {
    const novo = Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, tema.tamanho + delta));
    if (novo === tema.tamanho) return;
    tema = { ...tema, tamanho: novo };
    salvarTema(tema);
    aplicarTemaNoElemento(elementoAlvo, tema);
    renderizarPainel();
  }

  function renderizarPainel() {
    const cores = Object.keys(TEMA_OPCOES[tema.modo].cores);
    painel.innerHTML = `
      <div class="rotuloTema">Modo</div>
      <div class="linhaOpcoesTema">
        <button type="button" class="opcaoModo ${tema.modo === 'noite' ? 'ativo' : ''}" data-modo="noite">🌙 Noite</button>
        <button type="button" class="opcaoModo ${tema.modo === 'dia' ? 'ativo' : ''}" data-modo="dia">☀️ Dia</button>
      </div>
      <div class="rotuloTema">Cor da letra</div>
      <div class="linhaOpcoesTema">
        ${cores.map(c => `
          <button type="button" class="opcaoCor ${tema.cor === c ? 'ativo' : ''}" data-cor="${c}">
            <span class="amostraCor" style="background:${TEMA_OPCOES[tema.modo].cores[c]}"></span>${nomeCor(c)}
          </button>
        `).join('')}
      </div>
      <div class="rotuloTema">Fonte da letra</div>
      <div class="linhaOpcoesTema">
        ${Object.entries(FONTE_OPCOES).map(([chave, f]) => `
          <button type="button" class="opcaoFonte ${tema.fonte === chave ? 'ativo' : ''}" data-fonte="${chave}" style="font-family:${f.familia}">${f.nome}</button>
        `).join('')}
      </div>
      <div class="rotuloTema">Tamanho da letra</div>
      <div class="linhaTamanho">
        <button type="button" id="btnFonteMenor" aria-label="Diminuir letra"><span class="tMini">T</span><span>−</span></button>
        <span class="valorTamanho">${tema.tamanho}px</span>
        <button type="button" id="btnFonteMaior" aria-label="Aumentar letra"><span class="tMaior">T</span><span>+</span></button>
      </div>
    `;

    painel.querySelectorAll('.opcaoModo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const novoModo = btn.getAttribute('data-modo');
        if (novoModo === tema.modo) return;
        const coresDisponiveis = Object.keys(TEMA_OPCOES[novoModo].cores);
        tema = { ...tema, modo: novoModo, cor: coresDisponiveis.includes(tema.cor) ? tema.cor : coresDisponiveis[0] };
        salvarTema(tema);
        aplicarTemaNoElemento(elementoAlvo, tema);
        renderizarPainel();
      });
    });

    painel.querySelectorAll('.opcaoCor').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        tema = { ...tema, cor: btn.getAttribute('data-cor') };
        salvarTema(tema);
        aplicarTemaNoElemento(elementoAlvo, tema);
        renderizarPainel();
      });
    });

    painel.querySelectorAll('.opcaoFonte').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        tema = { ...tema, fonte: btn.getAttribute('data-fonte') };
        salvarTema(tema);
        aplicarTemaNoElemento(elementoAlvo, tema);
        renderizarPainel();
      });
    });

    document.getElementById('btnFonteMenor').addEventListener('click', (e) => {
      e.stopPropagation();
      ajustarTamanho(-TAMANHO_PASSO);
    });
    document.getElementById('btnFonteMaior').addEventListener('click', (e) => {
      e.stopPropagation();
      ajustarTamanho(TAMANHO_PASSO);
    });
  }

  renderizarPainel();

  botao.addEventListener('click', (e) => {
    e.stopPropagation();
    painel.classList.toggle('aberto');
  });

  document.addEventListener('click', (e) => {
    if (!painel.contains(e.target) && e.target !== botao) {
      painel.classList.remove('aberto');
    }
  });

  return {
    obterTema: () => tema,
    mostrar: () => { botao.style.display = 'flex'; },
    esconder: () => { botao.style.display = 'none'; painel.classList.remove('aberto'); }
  };
}
