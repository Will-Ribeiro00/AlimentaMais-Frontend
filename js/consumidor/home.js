/* =========================================================
   ALIMENTA+ | HOME DO CONSUMIDOR
   ---------------------------------------------------------
   Responsabilidades desta página:

   - validar a sessão do consumidor;
   - identificar o usuário quando possível;
   - exibir data e saudação;
   - carregar e renderizar ofertas;
   - pesquisar ofertas;
   - filtrar por categoria;
   - abrir detalhes da oferta;
   - realizar reserva;
   - reduzir estoque;
   - salvar reservas;
   - exibir confirmação;
   - copiar código da reserva;
   - controlar chatbot;
   - exibir mensagens de feedback;
   - realizar logout.

   IMPORTANTE:
   Este arquivo controla SOMENTE a Home.

   Reservas → reservas.html / reservas.js
   Perfil   → perfil.html / perfil.js

   Não recriar aqui a lógica dessas páginas.
========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const CONFIG = {
  STORAGE_OFERTAS: "alimentaOfertas",

  STORAGE_RESERVAS: "alimentaReservas",

  STORAGE_USUARIO: "alimentaUsuario",

  TOKEN: "accessToken",

  LOGIN_URL: "../loginECadastro/index.html",

  RESERVAS_URL: "reservas.html",

  PERFIL_URL: "perfil.html",

  TOAST_DURATION: 3000,
};

/* =========================================================
   ESTADO DA HOME
========================================================= */

const estado = {
  ofertas: [],

  reservas: [],

  categoriaAtual: "todos",

  termoBusca: "",

  ofertaSelecionada: null,

  usuario: null,
};

/* =========================================================
   DADOS DEMONSTRATIVOS
   ---------------------------------------------------------
   Estes dados preservam o comportamento funcional que já
   existia na versão anterior do consumidor.

   Quando a API de ofertas estiver integrada, esta função
   poderá ser substituída pelo serviço correspondente sem
   alterar a estrutura da Home.
========================================================= */

const OFERTAS_DEMONSTRACAO = [
  {
    id: "demo-oferta-1",
    titulo: "Kit Padaria do Dia",
    descricao:
      "Seleção de produtos frescos da padaria disponíveis para retirada.",
    categoria: "padaria",
    estabelecimento: "Padaria Pão & Vida",
    endereco: "Rua das Flores, 120",
    retirada: "Hoje, das 17h às 20h",
    preco: 12.9,
    precoOriginal: 24.9,
    estoque: 8,
    imagem: "",
  },

  {
    id: "demo-oferta-2",
    titulo: "Cesta Hortifruti",
    descricao:
      "Frutas e verduras selecionadas que ainda estão próprias para consumo.",
    categoria: "hortifruti",
    estabelecimento: "Mercado Boa Colheita",
    endereco: "Avenida Central, 450",
    retirada: "Hoje, das 18h às 21h",
    preco: 15.9,
    precoOriginal: 31.9,
    estoque: 5,
    imagem: "",
  },

  {
    id: "demo-oferta-3",
    titulo: "Refeição do Dia",
    descricao:
      "Refeição preparada no dia, disponibilizada com desconto especial.",
    categoria: "refeicoes",
    estabelecimento: "Sabor da Casa",
    endereco: "Rua Esperança, 85",
    retirada: "Hoje, das 18h às 20h",
    preco: 10.9,
    precoOriginal: 22.9,
    estoque: 6,
    imagem: "",
  },

  {
    id: "demo-oferta-4",
    titulo: "Bebidas Selecionadas",
    descricao:
      "Seleção de bebidas disponíveis para retirada no estabelecimento.",
    categoria: "bebidas",
    estabelecimento: "Mercado Verde",
    endereco: "Rua do Comércio, 210",
    retirada: "Hoje, das 16h às 19h",
    preco: 8.9,
    precoOriginal: 16.9,
    estoque: 10,
    imagem: "",
  },
];

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", iniciarHome);

function iniciarHome() {
  /* -----------------------------------------------------
       1. Verifica sessão
    ----------------------------------------------------- */

  if (!possuiSessao()) {
    redirecionarParaLogin();

    return;
  }

  /* -----------------------------------------------------
       2. Recupera usuário
    ----------------------------------------------------- */

  estado.usuario = obterUsuario();

  /* -----------------------------------------------------
       3. Carrega dados
    ----------------------------------------------------- */

  estado.ofertas = carregarOfertas();

  estado.reservas = carregarReservas();

  /* -----------------------------------------------------
       4. Configura interface
    ----------------------------------------------------- */

  atualizarUsuario();

  atualizarData();

  configurarNavegacao();

  configurarBusca();

  configurarCategorias();

  configurarOfertas();

  configurarModal();

  configurarConfirmacao();

  configurarChatbot();

  configurarLogout();

  /* -----------------------------------------------------
       5. Render inicial
    ----------------------------------------------------- */

  renderizarOfertas();
}

/* =========================================================
   SESSÃO
========================================================= */

function possuiSessao() {
  const token = sessionStorage.getItem(CONFIG.TOKEN);

  return Boolean(token);
}

function redirecionarParaLogin() {
  window.location.href = CONFIG.LOGIN_URL;
}

/* =========================================================
   USUÁRIO
========================================================= */

function obterUsuario() {
  const usuarioSalvo = localStorage.getItem(CONFIG.STORAGE_USUARIO);

  if (usuarioSalvo) {
    try {
      return JSON.parse(usuarioSalvo);
    } catch (error) {
      console.warn("Não foi possível interpretar o usuário salvo.", error);
    }
  }

  const token = sessionStorage.getItem(CONFIG.TOKEN);

  if (!token) {
    return null;
  }

  const usuarioToken = extrairDadosDoToken(token);

  if (usuarioToken) {
    return usuarioToken;
  }

  return null;
}

function extrairDadosDoToken(token) {
  try {
    const partes = token.split(".");

    if (partes.length !== 3) {
      return null;
    }

    const payload = partes[1];

    const payloadCorrigido = payload.replace(/-/g, "+").replace(/_/g, "/");

    const json = decodeURIComponent(
      atob(payloadCorrigido)
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(json);
  } catch (error) {
    console.warn("Não foi possível interpretar os dados do token.", error);

    return null;
  }
}

function atualizarUsuario() {
  const elementoNome = document.getElementById("nome-usuario");

  if (!elementoNome) {
    return;
  }

  const nome = obterNomeUsuario();

  elementoNome.textContent = nome;
}

function obterNomeUsuario() {
  if (!estado.usuario) {
    return "usuário";
  }

  return (
    estado.usuario.nome ||
    estado.usuario.name ||
    estado.usuario.nomeUsuario ||
    estado.usuario.nomeCompleto ||
    "usuário"
  );
}

/* =========================================================
   DATA
========================================================= */

function atualizarData() {
  const elementoData = document.getElementById("data-atual");

  if (!elementoData) {
    return;
  }

  const agora = new Date();

  const dia = String(agora.getDate()).padStart(2, "0");

  const mes = String(agora.getMonth() + 1).padStart(2, "0");

  const ano = agora.getFullYear();

  elementoData.textContent = `${dia}/${mes}/${ano}`;
}

/* =========================================================
   NAVEGAÇÃO
========================================================= */

function configurarNavegacao() {
  const linkReservas = document.querySelector('a[href="reservas.html"]');

  const linkPerfil = document.querySelector('a[href="perfil.html"]');

  if (linkReservas) {
    linkReservas.addEventListener("click", () => {
      salvarEstadoAtual();
    });
  }

  if (linkPerfil) {
    linkPerfil.addEventListener("click", () => {
      salvarEstadoAtual();
    });
  }

  const botaoExplorar = document.querySelector("[data-scroll-ofertas]");

  if (botaoExplorar) {
    botaoExplorar.addEventListener("click", () => {
      const ofertas = document.getElementById("resultados-ofertas");

      if (ofertas) {
        ofertas.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  const botaoIrReservas = document.getElementById("btn-ir-reservas");

  if (botaoIrReservas) {
    botaoIrReservas.addEventListener("click", () => {
      fecharModalConfirmacao();

      window.location.href = CONFIG.RESERVAS_URL;
    });
  }
}

/* =========================================================
   BUSCA
========================================================= */

function configurarBusca() {
  const campoBusca = document.getElementById("campo-busca");

  const botaoLimpar = document.getElementById("limpar-busca");

  if (!campoBusca) {
    return;
  }

  campoBusca.addEventListener("input", () => {
    estado.termoBusca = normalizarTexto(campoBusca.value);

    renderizarOfertas();
  });

  if (botaoLimpar) {
    botaoLimpar.addEventListener("click", () => {
      campoBusca.value = "";

      estado.termoBusca = "";

      campoBusca.focus();

      renderizarOfertas();
    });
  }
}

/* =========================================================
   CATEGORIAS
========================================================= */

function configurarCategorias() {
  const filtros = document.querySelectorAll(".filtro");

  filtros.forEach((filtro) => {
    filtro.addEventListener("click", () => {
      estado.categoriaAtual = filtro.dataset.categoria || "todos";

      filtros.forEach((item) => {
        const ativo = item === filtro;

        item.classList.toggle("active", ativo);

        item.setAttribute("aria-pressed", String(ativo));
      });

      renderizarOfertas();
    });
  });

  const botaoLimpar = document.getElementById("btn-limpar-filtros");

  if (botaoLimpar) {
    botaoLimpar.addEventListener("click", limparFiltros);
  }
}

function limparFiltros() {
  estado.categoriaAtual = "todos";

  estado.termoBusca = "";

  const campoBusca = document.getElementById("campo-busca");

  if (campoBusca) {
    campoBusca.value = "";
  }

  document.querySelectorAll(".filtro").forEach((filtro) => {
    const ativo = filtro.dataset.categoria === "todos";

    filtro.classList.toggle("active", ativo);

    filtro.setAttribute("aria-pressed", String(ativo));
  });

  renderizarOfertas();
}

/* =========================================================
   OFERTAS
========================================================= */

function configurarOfertas() {
  const lista = document.getElementById("grid-ofertas");

  if (!lista) {
    return;
  }

  lista.addEventListener("click", (event) => {
    const card = event.target.closest("[data-oferta-id]");

    if (!card) {
      return;
    }

    const oferta = encontrarOferta(card.dataset.ofertaId);

    if (oferta) {
      abrirModalOferta(oferta);
    }
  });

  lista.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const card = event.target.closest("[data-oferta-id]");

    if (!card) {
      return;
    }

    event.preventDefault();

    const oferta = encontrarOferta(card.dataset.ofertaId);

    if (oferta) {
      abrirModalOferta(oferta);
    }
  });
}

function carregarOfertas() {
  const ofertasSalvas = localStorage.getItem(CONFIG.STORAGE_OFERTAS);

  if (!ofertasSalvas) {
    const demonstracao = clonarDados(OFERTAS_DEMONSTRACAO);

    salvarOfertas(demonstracao);

    return demonstracao;
  }

  try {
    const ofertas = JSON.parse(ofertasSalvas);

    if (!Array.isArray(ofertas)) {
      throw new Error("Formato inválido.");
    }

    return ofertas;
  } catch (error) {
    console.warn(
      "As ofertas salvas estão inválidas. Restaurando demonstração.",
      error,
    );

    const demonstracao = clonarDados(OFERTAS_DEMONSTRACAO);

    salvarOfertas(demonstracao);

    return demonstracao;
  }
}

function salvarOfertas(ofertas) {
  localStorage.setItem(CONFIG.STORAGE_OFERTAS, JSON.stringify(ofertas));
}

function renderizarOfertas() {
  const lista = document.getElementById("grid-ofertas");

  const contador = document.getElementById("ofertas-count");

  const estadoVazio = document.getElementById("estado-sem-ofertas");

  if (!lista) {
    return;
  }

  const ofertasFiltradas = obterOfertasFiltradas();

  lista.innerHTML = "";

  ofertasFiltradas.forEach((oferta) => {
    lista.appendChild(criarCardOferta(oferta));
  });

  if (contador) {
    contador.textContent = formatarQuantidadeOfertas(ofertasFiltradas.length);
  }

  if (estadoVazio) {
    estadoVazio.classList.toggle("hidden", ofertasFiltradas.length > 0);
  }

  atualizarResultadoBusca(ofertasFiltradas);
}

function obterOfertasFiltradas() {
  let resultado = estado.ofertas.filter((oferta) => {
    return Number(oferta.estoque) > 0;
  });

  if (estado.categoriaAtual && estado.categoriaAtual !== "todos") {
    resultado = resultado.filter((oferta) => {
      return (
        normalizarTexto(oferta.categoria) ===
        normalizarTexto(estado.categoriaAtual)
      );
    });
  }

  if (estado.termoBusca) {
    const termo = estado.termoBusca;

    resultado = resultado.filter((oferta) => {
      const textoOferta = [
        oferta.titulo,

        oferta.nome,

        oferta.descricao,

        oferta.categoria,

        oferta.estabelecimento,

        oferta.nomeEstabelecimento,

        oferta.endereco,
      ]
        .filter(Boolean)
        .join(" ");

      return normalizarTexto(textoOferta).includes(termo);
    });
  }

  return resultado;
}

function criarCardOferta(oferta) {
  const card = document.createElement("article");

  card.className = "oferta-card";

  card.dataset.ofertaId = oferta.id;

  card.tabIndex = 0;

  const preco = obterPrecoOferta(oferta);

  const precoOriginal = obterPrecoOriginal(oferta);

  const desconto = calcularDesconto(preco, precoOriginal);

  const estoque = Number(oferta.estoque);

  card.innerHTML = `

        <div class="oferta-imagem">

            ${
              oferta.imagem
                ? `
                        <img
                            src="${escapeAttribute(oferta.imagem)}"
                            alt="${escapeAttribute(oferta.titulo || "Oferta")}"
                        >
                    `
                : `
                        <div
                            class="oferta-imagem-placeholder"
                            aria-hidden="true"
                        >
                            +
                        </div>
                    `
            }

        </div>


        <div class="oferta-conteudo">

            <span class="oferta-categoria">
                ${escapeHtml(formatarCategoria(oferta.categoria))}
            </span>


            <h3>
                ${escapeHtml(obterTituloOferta(oferta))}
            </h3>


            <p class="oferta-descricao">
                ${escapeHtml(
                  oferta.descricao || "Oferta de alimentos excedentes.",
                )}
            </p>


            <div class="oferta-estabelecimento">

                <strong>
                    ${escapeHtml(
                      oferta.estabelecimento ||
                        oferta.nomeEstabelecimento ||
                        "Estabelecimento",
                    )}
                </strong>

                ${
                  oferta.endereco
                    ? `
                            <span>
                                ${escapeHtml(oferta.endereco)}
                            </span>
                        `
                    : ""
                }

            </div>


            <div class="oferta-precos">

                <div>

                    <span>
                        Preço Alimenta+
                    </span>

                    <strong>
                        ${formatarMoeda(preco)}
                    </strong>

                </div>


                ${
                  precoOriginal > preco
                    ? `
                            <del>
                                ${formatarMoeda(precoOriginal)}
                            </del>
                        `
                    : ""
                }


                ${
                  desconto > 0
                    ? `
                            <span class="oferta-desconto">
                                ${desconto}% OFF
                            </span>
                        `
                    : ""
                }

            </div>


            <div class="oferta-rodape">

                <span class="oferta-estoque">

                    ${
                      estoque === 1
                        ? "1 unidade disponível"
                        : `${estoque} unidades disponíveis`
                    }

                </span>


                <button
                    class="btn-reservar"
                    type="button"
                    data-abrir-oferta="${escapeAttribute(String(oferta.id))}"
                >
                    Ver oferta
                </button>

            </div>

        </div>

    `;

  const botao = card.querySelector("[data-abrir-oferta]");

  if (botao) {
    botao.addEventListener("click", (event) => {
      event.stopPropagation();

      abrirModalOferta(oferta);
    });
  }

  return card;
}

function atualizarResultadoBusca(ofertas) {
  const resultado = document.getElementById("resultado-busca");

  if (!resultado) {
    return;
  }

  if (!estado.termoBusca) {
    resultado.innerHTML = "";

    return;
  }

  resultado.textContent = `${ofertas.length} ${
    ofertas.length === 1 ? "oferta encontrada" : "ofertas encontradas"
  } para "${estado.termoBusca}"`;
}

function encontrarOferta(id) {
  return estado.ofertas.find((oferta) => String(oferta.id) === String(id));
}

/* =========================================================
   MODAL DA OFERTA
========================================================= */

function configurarModal() {
  const botaoFechar = document.getElementById("btn-fechar-modal");

  if (botaoFechar) {
    botaoFechar.addEventListener("click", fecharModalOferta);
  }

  const modal = document.getElementById("modal-oferta");

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        fecharModalOferta();
      }
    });
  }

  const botaoReservar = document.getElementById("btn-reservar");

  if (botaoReservar) {
    botaoReservar.addEventListener("click", reservarOferta);
  }
}

function abrirModalOferta(oferta) {
  estado.ofertaSelecionada = oferta;

  const modal = document.getElementById("modal-oferta");

  if (!modal) {
    return;
  }

  preencherModalOferta(oferta);

  modal.classList.add("active");

  modal.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  const botaoFechar = document.getElementById("btn-fechar-modal");

  if (botaoFechar) {
    botaoFechar.focus();
  }
}

function preencherModalOferta(oferta) {
  const imagem = document.getElementById("modal-imagem");

  const categoria = document.getElementById("modal-categoria");

  const titulo = document.getElementById("modal-titulo");

  const descricao = document.getElementById("modal-descricao");

  const preco = document.getElementById("modal-preco");

  const precoOriginal = document.getElementById("modal-preco-original");

  const desconto = document.getElementById("modal-desconto");

  const estabelecimento = document.getElementById("modal-estabelecimento");

  const endereco = document.getElementById("modal-endereco");

  const retirada = document.getElementById("modal-retirada");

  const estoque = document.getElementById("modal-estoque");

  const botaoReservar = document.getElementById("btn-reservar");

  const valor = obterPrecoOferta(oferta);

  const valorOriginal = obterPrecoOriginal(oferta);

  const percentual = calcularDesconto(valor, valorOriginal);

  if (imagem) {
    if (oferta.imagem) {
      imagem.src = oferta.imagem;

      imagem.alt = obterTituloOferta(oferta);

      imagem.classList.remove("hidden");
    } else {
      imagem.removeAttribute("src");

      imagem.alt = "";

      imagem.classList.add("hidden");
    }
  }

  if (categoria) {
    categoria.textContent = formatarCategoria(oferta.categoria);
  }

  if (titulo) {
    titulo.textContent = obterTituloOferta(oferta);
  }

  if (descricao) {
    descricao.textContent =
      oferta.descricao || "Oferta de alimentos excedentes.";
  }

  if (preco) {
    preco.textContent = formatarMoeda(valor);
  }

  if (precoOriginal) {
    precoOriginal.textContent = formatarMoeda(valorOriginal);
  }

  if (desconto) {
    desconto.textContent = percentual > 0 ? `${percentual}%` : "Sem desconto";
  }

  if (estabelecimento) {
    estabelecimento.textContent =
      oferta.estabelecimento || oferta.nomeEstabelecimento || "Não informado";
  }

  if (endereco) {
    endereco.textContent = oferta.endereco || "Endereço não informado";
  }

  if (retirada) {
    retirada.textContent = oferta.retirada || "Horário não informado";
  }

  if (estoque) {
    const quantidade = Number(oferta.estoque);

    if (quantidade <= 0) {
      estoque.textContent = "Oferta esgotada.";

      estoque.classList.add("indisponivel");
    } else {
      estoque.textContent =
        quantidade === 1
          ? "Última unidade disponível."
          : `${quantidade} unidades disponíveis.`;

      estoque.classList.remove("indisponivel");
    }
  }

  if (botaoReservar) {
    const disponivel = Number(oferta.estoque) > 0;

    botaoReservar.disabled = !disponivel;

    botaoReservar.textContent = disponivel
      ? "Reservar oferta"
      : "Oferta esgotada";
  }
}

function fecharModalOferta() {
  const modal = document.getElementById("modal-oferta");

  if (!modal) {
    return;
  }

  modal.classList.remove("active");

  modal.setAttribute("aria-hidden", "true");

  estado.ofertaSelecionada = null;

  if (!document.querySelector(".modal-overlay.active")) {
    document.body.classList.remove("modal-open");
  }
}

/* =========================================================
   RESERVA
========================================================= */

function reservarOferta() {
  const oferta = estado.ofertaSelecionada;

  if (!oferta) {
    return;
  }

  const estoqueAtual = Number(oferta.estoque);

  if (estoqueAtual <= 0) {
    mostrarToast("Esta oferta não possui mais unidades disponíveis.");

    return;
  }

  const reserva = {
    id: gerarIdReserva(),

    codigo: gerarCodigoReserva(),

    ofertaId: oferta.id,

    ofertaTitulo: obterTituloOferta(oferta),

    categoria: oferta.categoria,

    estabelecimento:
      oferta.estabelecimento || oferta.nomeEstabelecimento || "Estabelecimento",

    endereco: oferta.endereco || "",

    retirada: oferta.retirada || "",

    preco: obterPrecoOferta(oferta),

    data: new Date().toISOString(),

    status: "reservada",
  };

  estado.reservas.push(reserva);

  oferta.estoque = estoqueAtual - 1;

  salvarOfertas(estado.ofertas);

  salvarReservas(estado.reservas);

  preencherModalOferta(oferta);

  renderizarOfertas();

  fecharModalOferta();

  abrirModalConfirmacao(reserva.codigo);
}

/* =========================================================
   RESERVAS
========================================================= */

function carregarReservas() {
  const reservasSalvas = localStorage.getItem(CONFIG.STORAGE_RESERVAS);

  if (!reservasSalvas) {
    return [];
  }

  try {
    const reservas = JSON.parse(reservasSalvas);

    if (!Array.isArray(reservas)) {
      return [];
    }

    return reservas;
  } catch (error) {
    console.warn("Não foi possível carregar as reservas.", error);

    return [];
  }
}

function salvarReservas(reservas) {
  localStorage.setItem(CONFIG.STORAGE_RESERVAS, JSON.stringify(reservas));
}

/* =========================================================
   MODAL DE CONFIRMAÇÃO
========================================================= */

function configurarConfirmacao() {
  const modal = document.getElementById("modal-confirmacao");

  if (!modal) {
    return;
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      fecharModalConfirmacao();
    }
  });

  const botaoCopiar = document.getElementById("btn-copiar-codigo");

  if (botaoCopiar) {
    botaoCopiar.addEventListener("click", copiarCodigoReserva);
  }
}

function abrirModalConfirmacao(codigo) {
  const modal = document.getElementById("modal-confirmacao");

  const elementoCodigo = document.getElementById("confirmacao-codigo");

  if (!modal) {
    return;
  }

  if (elementoCodigo) {
    elementoCodigo.textContent = codigo;
  }

  modal.classList.add("active");

  modal.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  const botao = document.getElementById("btn-ir-reservas");

  if (botao) {
    botao.focus();
  }
}

function fecharModalConfirmacao() {
  const modal = document.getElementById("modal-confirmacao");

  if (!modal) {
    return;
  }

  modal.classList.remove("active");

  modal.setAttribute("aria-hidden", "true");

  if (!document.querySelector(".modal-overlay.active")) {
    document.body.classList.remove("modal-open");
  }
}

async function copiarCodigoReserva() {
  const elemento = document.getElementById("confirmacao-codigo");

  if (!elemento) {
    return;
  }

  const codigo = elemento.textContent.trim();

  try {
    await navigator.clipboard.writeText(codigo);

    mostrarToast("Código copiado.");
  } catch (error) {
    console.warn("Não foi possível copiar automaticamente.", error);

    mostrarToast("Não foi possível copiar o código.");
  }
}

/* =========================================================
   CHATBOT
========================================================= */

function configurarChatbot() {
  const botaoAbrir = document.getElementById("btn-chatbot");

  const botaoFechar = document.getElementById("btn-fechar-chatbot");

  const formulario = document.getElementById("chatbot-form");

  if (botaoAbrir) {
    botaoAbrir.addEventListener("click", alternarChatbot);
  }

  if (botaoFechar) {
    botaoFechar.addEventListener("click", fecharChatbot);
  }

  if (formulario) {
    formulario.addEventListener("submit", responderChatbot);
  }

  document.querySelectorAll(".chatbot-opcao").forEach((botao) => {
    botao.addEventListener("click", () => {
      const pergunta = botao.dataset.pergunta;

      responderPerguntaChatbot(pergunta);
    });
  });
}

function alternarChatbot() {
  const chatbot = document.getElementById("chatbot");

  if (!chatbot) {
    return;
  }

  const aberto = chatbot.getAttribute("aria-hidden") === "false";

  if (aberto) {
    fecharChatbot();
  } else {
    abrirChatbot();
  }
}

function abrirChatbot() {
  const chatbot = document.getElementById("chatbot");

  const botao = document.getElementById("btn-chatbot");

  if (!chatbot) {
    return;
  }

  chatbot.classList.add("active");

  chatbot.setAttribute("aria-hidden", "false");

  if (botao) {
    botao.setAttribute("aria-expanded", "true");
  }

  const campo = document.getElementById("chatbot-input");

  if (campo) {
    campo.focus();
  }
}

function fecharChatbot() {
  const chatbot = document.getElementById("chatbot");

  const botao = document.getElementById("btn-chatbot");

  if (!chatbot) {
    return;
  }

  chatbot.classList.remove("active");

  chatbot.setAttribute("aria-hidden", "true");

  if (botao) {
    botao.setAttribute("aria-expanded", "false");
  }
}

function responderChatbot(event) {
  event.preventDefault();

  const campo = document.getElementById("chatbot-input");

  if (!campo) {
    return;
  }

  const mensagem = campo.value.trim();

  if (!mensagem) {
    return;
  }

  adicionarMensagemChatbot(mensagem, "usuario");

  campo.value = "";

  const resposta = gerarRespostaChatbot(mensagem);

  window.setTimeout(() => {
    adicionarMensagemChatbot(resposta, "bot");
  }, 300);
}

function responderPerguntaChatbot(pergunta) {
  const respostas = {
    pagamento:
      "As informações de pagamento ficam disponíveis durante o processo de reserva. Se precisar, posso orientar você sobre a reserva.",

    reserva:
      "Escolha uma oferta, confira os detalhes e clique em Reservar oferta. Depois você receberá um código para acompanhar sua reserva.",

    produto:
      "Você pode encontrar ofertas usando a busca ou filtrando pelas categorias disponíveis na Home.",

    troca:
      "Para informações sobre alterações ou problemas com uma reserva, consulte os detalhes da reserva e procure o suporte do Alimenta+.",
  };

  adicionarMensagemChatbot(pergunta, "usuario");

  window.setTimeout(() => {
    adicionarMensagemChatbot(
      respostas[pergunta] ||
        "Posso ajudar com reservas, produtos e informações sobre o Alimenta+.",
      "bot",
    );
  }, 300);
}

function gerarRespostaChatbot(mensagem) {
  const texto = normalizarTexto(mensagem);

  if (texto.includes("reserva") || texto.includes("reservar")) {
    return "Para reservar, escolha uma oferta disponível, confira os detalhes e clique em Reservar oferta.";
  }

  if (texto.includes("pagamento") || texto.includes("pagar")) {
    return "As informações de pagamento são apresentadas durante o fluxo da reserva.";
  }

  if (
    texto.includes("produto") ||
    texto.includes("oferta") ||
    texto.includes("comida")
  ) {
    return "Você pode procurar uma oferta pela busca ou selecionar uma categoria na Home.";
  }

  if (texto.includes("troca") || texto.includes("cancelar")) {
    return "Para verificar uma reserva, acesse Minhas Reservas pelo menu lateral.";
  }

  return "Posso ajudar com ofertas, reservas, produtos e informações sobre o Alimenta+.";
}

function adicionarMensagemChatbot(mensagem, tipo) {
  const container = document.getElementById("chatbot-mensagens");

  if (!container) {
    return;
  }

  const elemento = document.createElement("div");

  elemento.className = `chatbot-mensagem ${tipo === "usuario" ? "usuario" : "bot"}`;

  const paragrafo = document.createElement("p");

  paragrafo.textContent = mensagem;

  elemento.appendChild(paragrafo);

  container.appendChild(elemento);

  container.scrollTop = container.scrollHeight;
}

/* =========================================================
   LOGOUT
========================================================= */

function configurarLogout() {
  const botao = document.getElementById("btn-sair");

  if (!botao) {
    return;
  }

  botao.addEventListener("click", executarLogout);
}

function executarLogout() {
  sessionStorage.removeItem(CONFIG.TOKEN);

  window.location.href = CONFIG.LOGIN_URL;
}

/* =========================================================
   TOAST
========================================================= */

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");

  const texto = document.getElementById("toast-mensagem");

  if (!toast || !texto) {
    return;
  }

  texto.textContent = mensagem;

  toast.classList.add("active");

  window.clearTimeout(mostrarToast.timer);

  mostrarToast.timer = window.setTimeout(() => {
    toast.classList.remove("active");
  }, CONFIG.TOAST_DURATION);
}

/* =========================================================
   ESTADO
========================================================= */

function salvarEstadoAtual() {
  /*
   * Neste momento não precisamos salvar a aba ativa,
   * porque as páginas agora são independentes.
   *
   * Esta função existe apenas como ponto de extensão
   * caso futuramente seja necessário preservar filtros
   * ou posição de navegação.
   */
}

/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarMoeda(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarQuantidadeOfertas(quantidade) {
  return quantidade === 1 ? "1 oferta" : `${quantidade} ofertas`;
}

function formatarCategoria(categoria) {
  const categorias = {
    todos: "Todos",

    padaria: "Padaria",

    hortifruti: "Hortifruti",

    refeicoes: "Refeições",

    bebidas: "Bebidas",

    restaurante: "Restaurante",

    mercado: "Mercado",

    outro: "Outro",
  };

  const chave = normalizarTexto(categoria);

  return categorias[chave] || categoria || "Oferta";
}

function obterTituloOferta(oferta) {
  return oferta.titulo || oferta.nome || "Oferta Alimenta+";
}

function obterPrecoOferta(oferta) {
  return Number(oferta.preco ?? oferta.precoAlimenta ?? 0);
}

function obterPrecoOriginal(oferta) {
  return Number(
    oferta.precoOriginal ?? oferta.precoOrigina ?? oferta.precoMercado ?? 0,
  );
}

function calcularDesconto(preco, precoOriginal) {
  if (
    !Number.isFinite(preco) ||
    !Number.isFinite(precoOriginal) ||
    precoOriginal <= 0 ||
    preco >= precoOriginal
  ) {
    return 0;
  }

  return Math.round((1 - preco / precoOriginal) * 100);
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* =========================================================
   IDS
========================================================= */

function gerarIdReserva() {
  return "res-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function gerarCodigoReserva() {
  const numero = Math.floor(1000 + Math.random() * 9000);

  return `#ALIMENTA-${numero}`;
}

/* =========================================================
   SEGURANÇA / HTML
========================================================= */

function escapeHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(valor) {
  return escapeHtml(valor);
}

/* =========================================================
   UTILITÁRIO
========================================================= */

function clonarDados(dados) {
  return JSON.parse(JSON.stringify(dados));
}

/* =========================================================
   ACESSIBILIDADE / TECLADO
========================================================= */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const modalOferta = document.getElementById("modal-oferta");

  const modalConfirmacao = document.getElementById("modal-confirmacao");

  const chatbot = document.getElementById("chatbot");

  if (modalOferta && modalOferta.classList.contains("active")) {
    fecharModalOferta();

    return;
  }

  if (modalConfirmacao && modalConfirmacao.classList.contains("active")) {
    fecharModalConfirmacao();

    return;
  }

  if (chatbot && chatbot.classList.contains("active")) {
    fecharChatbot();
  }
});
