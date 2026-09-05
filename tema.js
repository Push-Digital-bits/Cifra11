// tema.js — sistema de tema (dia/noite) pra tela de leitura de cifra (G11 Cifras)

const TEMA_OPCOES = {
  noite: { bg: '#000000', cores: { laranja: '#F97316', branco: '#FFFFFF' } },
  dia:   { bg: '#FFFFFF', cores: { preto: '#111111', azul: '#0F172A', laranja: '#F97316' } }
};
const TEMA_PADRAO = { modo: 'noite', cor: 'laranja' };
const TEMA_CHAVE = 'temaCifra';

function obterTemaSalvo() {
  try {
    const bruto = localStorage.getItem(TEMA_CHAVE);
    if (!bruto) return { ...TEMA_PADRAO };
    const tema = JSON.parse(bruto);
    if (TEMA_OPCOES[tema.modo] && TEMA_OPCOES[tema.modo].cores[tema.cor]) return tema;
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
}

function nomeCor(chave) {
  const nomes = { laranja: 'Laranja', branco: 'Branco', preto: 'Preto', azul: 'Azul marinho' };
  return nomes[chave] || chave;
}

// elementoAlvo: elemento que recebe as variáveis CSS --tema-bg/--tema-texto/--tema-borda.
// opcoes.visivelDeInicio: se o botão flutuante começa visível (padrão: true).
function iniciarSeletorTema(elementoAlvo, opcoes = {}) {
  let tema = obterTemaSalvo();
  aplicarTemaNoElemento(elementoAlvo, tema);

  if (!document.getElementById('temaCifraEstilo')) {
    const style = document.createElement('style');
    style.id = 'temaCifraEstilo';
    style.textContent = `
      #botaoTema {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: #F97316;
        color: #0F172A;
        font-size: 24px;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.45);
        border: none;
        cursor: pointer;
        z-index: 1000;
        padding: 0;
      }
      #painelTema {
        position: fixed;
        bottom: 84px;
        right: 20px;
        left: 20px;
        margin-left: auto;
        background: #16213A;
        border: 1px solid #2A3A5C;
        border-radius: 14px;
        padding: 14px;
        max-width: 260px;
        display: none;
        z-index: 1000;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
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
      #painelTema button.opcaoModo, #painelTema button.opcaoCor {
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
    `;

    painel.querySelectorAll('.opcaoModo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const novoModo = btn.getAttribute('data-modo');
        if (novoModo === tema.modo) return;
        const coresDisponiveis = Object.keys(TEMA_OPCOES[novoModo].cores);
        tema = { modo: novoModo, cor: coresDisponiveis.includes(tema.cor) ? tema.cor : coresDisponiveis[0] };
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
