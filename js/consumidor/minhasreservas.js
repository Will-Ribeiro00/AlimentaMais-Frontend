/**
 * ============================================================
 * ALIMENTA+ | CONSUMIDOR | MINHAS RESERVAS
 * ------------------------------------------------------------
 * Responsabilidade deste arquivo:
 *
 * - Carregar as reservas do consumidor;
 * - Identificar o usuário atual;
 * - Exibir as reservas;
 * - Filtrar por status;
 * - Atualizar os indicadores da página;
 * - Abrir os detalhes de uma reserva;
 * - Permitir cancelamento quando aplicável;
 * - Exibir estados vazio e mensagens;
 * - Controlar o logout.
 *
 * IMPORTANTE:
 * Esta página é independente do antigo cliente.js.
 * O objetivo da nova arquitetura é separar responsabilidades
 * por tela.
 * ============================================================
 */

(() => {
  "use strict";

  /* =========================================================
       CONFIGURAÇÕES
       ========================================================= */

  const CONFIG = {
    LOGIN_URL: "../loginECadastro/index.html",

    STORAGE_RESERVAS: "alimentaReservas",

    STORAGE_USUARIO: "alimentaUsuario",

    STORAGE_TOKEN: "accessToken",
  };

  /* =========================================================
       ESTADO DA PÁGINA
       ========================================================= */

  let reservas = [];

  let reservasFiltradas = [];

  let reservaSelecionada = null;

  /* =========================================================
       REFERÊNCIAS DO DOM
       ========================================================= */

  const elementos = {
    lista: document.getElementById("lista-reservas"),

    estadoVazio: document.getElementById("estado-vazio-reservas"),

    filtroStatus: document.getElementById("filtro-status"),

    totalAtivas: document.getElementById("total-reservas-ativas"),

    totalPendentes: document.getElementById("total-reservas-pendentes"),

    totalConcluidas: document.getElementById("total-reservas-concluidas"),

    toast: document.getElementById("toast"),

    modal: document.getElementById("modal-reserva"),

    modalTitulo: document.getElementById("modal-reserva-titulo"),

    modalDetalhes: document.getElementById("modal-reserva-detalhes"),

    fecharModal: document.getElementById("btn-fechar-modal-reserva"),
  };

  /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

  function iniciar() {
    verificarSessao();

    carregarReservas();

    aplicarFiltro();

    atualizarResumo();

    configurarEventos();
  }

  /* =========================================================
       SESSÃO
       ========================================================= */

  function verificarSessao() {
    const token = sessionStorage.getItem(CONFIG.STORAGE_TOKEN);

    const usuario = obterUsuarioAtual();

    /*
     * O projeto atual utiliza accessToken no sessionStorage
     * durante o fluxo de login.
     *
     * Enquanto a autenticação definitiva do consumidor não
     * estiver integrada a uma API, aceitamos também o usuário
     * salvo localmente para manter a tela funcional.
     */
    if (!token && !usuario) {
      window.location.href = CONFIG.LOGIN_URL;
    }
  }

  function obterUsuarioAtual() {
    try {
      const usuarioSalvo = localStorage.getItem(CONFIG.STORAGE_USUARIO);

      if (!usuarioSalvo) {
        return null;
      }

      return JSON.parse(usuarioSalvo);
    } catch (erro) {
      console.error("Não foi possível recuperar o usuário:", erro);

      return null;
    }
  }

  /* =========================================================
       RESERVAS
       ========================================================= */

  function carregarReservas() {
    try {
      const reservasSalvas = localStorage.getItem(CONFIG.STORAGE_RESERVAS);

      if (!reservasSalvas) {
        reservas = [];

        return;
      }

      const dados = JSON.parse(reservasSalvas);

      if (!Array.isArray(dados)) {
        reservas = [];

        return;
      }

      const usuarioAtual = obterUsuarioAtual();

      /*
       * Se conseguirmos identificar o usuário, mostramos
       * somente as reservas pertencentes a ele.
       *
       * Caso o formato legado ainda não tenha consumidorId,
       * preservamos a reserva para não perder dados durante
       * a migração da arquitetura.
       */
      if (usuarioAtual) {
        reservas = dados.filter((reserva) => {
          return pertenceAoUsuario(reserva, usuarioAtual);
        });
      } else {
        reservas = dados;
      }
    } catch (erro) {
      console.error("Erro ao carregar reservas:", erro);

      reservas = [];

      mostrarToast("Não foi possível carregar suas reservas.", "erro");
    }
  }

  function pertenceAoUsuario(reserva, usuario) {
    /*
     * Compatibilidade com diferentes formatos utilizados
     * durante o desenvolvimento do Alimenta+.
     */

    const idsUsuario = [
      usuario?.id,
      usuario?.usuarioId,
      usuario?.userId,
      usuario?.clienteId,
    ]
      .filter(Boolean)
      .map(String);

    const idsReserva = [
      reserva?.usuarioId,
      reserva?.userId,
      reserva?.clienteId,
      reserva?.consumidorId,
    ]
      .filter(Boolean)
      .map(String);

    /*
     * Algumas reservas antigas podem ter sido criadas sem
     * vínculo explícito ao usuário.
     *
     * Nessa situação não descartamos automaticamente o dado.
     */
    if (idsReserva.length === 0) {
      return true;
    }

    return idsReserva.some((id) => idsUsuario.includes(id));
  }

  /* =========================================================
       FILTRO
       ========================================================= */

  function aplicarFiltro() {
    const statusSelecionado = elementos.filtroStatus?.value || "todas";

    if (statusSelecionado === "todas") {
      reservasFiltradas = [...reservas];
    } else {
      reservasFiltradas = reservas.filter((reserva) => {
        return normalizarStatus(reserva.status) === statusSelecionado;
      });
    }

    renderizarReservas();
  }

  /* =========================================================
       RENDERIZAÇÃO
       ========================================================= */

  function renderizarReservas() {
    if (!elementos.lista) {
      return;
    }

    elementos.lista.innerHTML = "";

    if (reservasFiltradas.length === 0) {
      elementos.lista.classList.add("hidden");

      elementos.estadoVazio?.classList.remove("hidden");

      return;
    }

    elementos.estadoVazio?.classList.add("hidden");

    elementos.lista.classList.remove("hidden");

    reservasFiltradas.forEach((reserva) => {
      const card = criarCardReserva(reserva);

      elementos.lista.appendChild(card);
    });
  }

  function criarCardReserva(reserva) {
    const article = document.createElement("article");

    article.className = "reserva-card";

    const status = normalizarStatus(reserva.status);

    const nomeOferta =
      reserva.nomeOferta ||
      reserva.ofertaNome ||
      reserva.nome ||
      "Oferta reservada";

    const estabelecimento =
      reserva.estabelecimentoNome ||
      reserva.estabelecimento ||
      "Estabelecimento";

    const quantidade = reserva.quantidade || reserva.qtd || 1;

    const dataRetirada =
      reserva.dataRetirada ||
      reserva.data ||
      reserva.dataReserva ||
      "Data não informada";

    const horario =
      reserva.horarioRetirada || reserva.horario || "Horário não informado";

    const codigo =
      reserva.codigo || reserva.codigoReserva || reserva.id || "Sem código";

    article.innerHTML = `
            <div class="reserva-card__conteudo">

                <div class="reserva-card__principal">

                    <div class="reserva-card__imagem" aria-hidden="true">
                        <span>+</span>
                    </div>

                    <div class="reserva-card__informacoes">

                        <div class="reserva-card__topo">

                            <span class="reserva-card__codigo">
                                Reserva #${escapeHtml(String(codigo))}
                            </span>

                            <span
                                class="reserva-status reserva-status--${escapeHtml(status)}"
                            >
                                ${escapeHtml(obterTextoStatus(status))}
                            </span>

                        </div>

                        <h3 class="reserva-card__titulo">
                            ${escapeHtml(nomeOferta)}
                        </h3>

                        <p class="reserva-card__estabelecimento">
                            ${escapeHtml(estabelecimento)}
                        </p>

                    </div>

                </div>


                <div class="reserva-card__dados">

                    <div class="reserva-card__dado">

                        <span class="reserva-card__rotulo">
                            Retirada
                        </span>

                        <strong>
                            ${escapeHtml(formatarData(dataRetirada))}
                        </strong>

                    </div>


                    <div class="reserva-card__dado">

                        <span class="reserva-card__rotulo">
                            Horário
                        </span>

                        <strong>
                            ${escapeHtml(String(horario))}
                        </strong>

                    </div>


                    <div class="reserva-card__dado">

                        <span class="reserva-card__rotulo">
                            Quantidade
                        </span>

                        <strong>
                            ${escapeHtml(String(quantidade))}
                        </strong>

                    </div>

                </div>


                <div class="reserva-card__acoes">

                    <button
                        type="button"
                        class="btn-secondary"
                        data-ver-reserva="${escapeHtml(
                          String(reserva.id ?? codigo),
                        )}"
                    >
                        Ver detalhes
                    </button>

                    ${
                      podeCancelar(reserva)
                        ? `
                                <button
                                    type="button"
                                    class="btn-secondary reserva-card__cancelar"
                                    data-cancelar-reserva="${escapeHtml(
                                      String(reserva.id ?? codigo),
                                    )}"
                                >
                                    Cancelar reserva
                                </button>
                            `
                        : ""
                    }

                </div>

            </div>
        `;

    return article;
  }

  /* =========================================================
       STATUS
       ========================================================= */

  function normalizarStatus(status) {
    if (!status) {
      return "pendente";
    }

    const valor = String(status).trim().toLowerCase();

    const mapa = {
      pendente: "pendente",
      aguardando: "pendente",
      "aguardando retirada": "pendente",

      confirmada: "confirmada",
      confirmado: "confirmada",

      concluida: "concluida",
      concluído: "concluida",
      concluído: "concluida",
      retirada: "concluida",

      cancelada: "cancelada",
      cancelado: "cancelada",
    };

    return mapa[valor] || "pendente";
  }

  function obterTextoStatus(status) {
    const textos = {
      pendente: "Aguardando retirada",
      confirmada: "Confirmada",
      concluida: "Concluída",
      cancelada: "Cancelada",
    };

    return textos[status] || "Aguardando retirada";
  }

  /* =========================================================
       RESUMO
       ========================================================= */

  function atualizarResumo() {
    const ativas = reservas.filter((reserva) => {
      const status = normalizarStatus(reserva.status);

      return status === "pendente" || status === "confirmada";
    }).length;

    const pendentes = reservas.filter((reserva) => {
      return normalizarStatus(reserva.status) === "pendente";
    }).length;

    const concluidas = reservas.filter((reserva) => {
      return normalizarStatus(reserva.status) === "concluida";
    }).length;

    if (elementos.totalAtivas) {
      elementos.totalAtivas.textContent = String(ativas);
    }

    if (elementos.totalPendentes) {
      elementos.totalPendentes.textContent = String(pendentes);
    }

    if (elementos.totalConcluidas) {
      elementos.totalConcluidas.textContent = String(concluidas);
    }
  }

  /* =========================================================
       DETALHES DA RESERVA
       ========================================================= */

  function abrirDetalhesReserva(id) {
    const reserva = localizarReserva(id);

    if (!reserva) {
      mostrarToast("Não foi possível localizar essa reserva.", "erro");

      return;
    }

    reservaSelecionada = reserva;

    const nomeOferta =
      reserva.nomeOferta ||
      reserva.ofertaNome ||
      reserva.nome ||
      "Oferta reservada";

    const estabelecimento =
      reserva.estabelecimentoNome ||
      reserva.estabelecimento ||
      "Estabelecimento";

    const quantidade = reserva.quantidade || reserva.qtd || 1;

    const dataRetirada =
      reserva.dataRetirada ||
      reserva.data ||
      reserva.dataReserva ||
      "Não informada";

    const horario =
      reserva.horarioRetirada || reserva.horario || "Não informado";

    const status = normalizarStatus(reserva.status);

    const codigo =
      reserva.codigo || reserva.codigoReserva || reserva.id || "Sem código";

    if (elementos.modalTitulo) {
      elementos.modalTitulo.textContent = nomeOferta;
    }

    if (elementos.modalDetalhes) {
      elementos.modalDetalhes.innerHTML = `
                <div class="modal-reserva-detalhes__grupo">

                    <span>
                        Código da reserva
                    </span>

                    <strong>
                        ${escapeHtml(String(codigo))}
                    </strong>

                </div>


                <div class="modal-reserva-detalhes__grupo">

                    <span>
                        Estabelecimento
                    </span>

                    <strong>
                        ${escapeHtml(estabelecimento)}
                    </strong>

                </div>


                <div class="modal-reserva-detalhes__grupo">

                    <span>
                        Status
                    </span>

                    <strong>
                        ${escapeHtml(obterTextoStatus(status))}
                    </strong>

                </div>


                <div class="modal-reserva-detalhes__grupo">

                    <span>
                        Data de retirada
                    </span>

                    <strong>
                        ${escapeHtml(formatarData(dataRetirada))}
                    </strong>

                </div>


                <div class="modal-reserva-detalhes__grupo">

                    <span>
                        Horário
                    </span>

                    <strong>
                        ${escapeHtml(String(horario))}
                    </strong>

                </div>


                <div class="modal-reserva-detalhes__grupo">

                    <span>
                        Quantidade
                    </span>

                    <strong>
                        ${escapeHtml(String(quantidade))}
                    </strong>

                </div>


                ${
                  podeCancelar(reserva)
                    ? `
                            <button
                                type="button"
                                class="btn-primary modal-reserva__cancelar"
                                data-modal-cancelar
                            >
                                Cancelar reserva
                            </button>
                        `
                    : ""
                }
            `;
    }

    abrirModal();
  }

  function localizarReserva(id) {
    const idTexto = String(id);

    return reservas.find((reserva) => {
      const identificador =
        reserva.id ?? reserva.codigo ?? reserva.codigoReserva;

      return String(identificador) === idTexto;
    });
  }

  /* =========================================================
       CANCELAMENTO
       ========================================================= */

  function podeCancelar(reserva) {
    const status = normalizarStatus(reserva?.status);

    return status === "pendente" || status === "confirmada";
  }

  function solicitarCancelamento(id) {
    const reserva = localizarReserva(id);

    if (!reserva) {
      mostrarToast("Reserva não encontrada.", "erro");

      return;
    }

    if (!podeCancelar(reserva)) {
      mostrarToast("Esta reserva não pode mais ser cancelada.", "erro");

      return;
    }

    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar esta reserva?",
    );

    if (!confirmar) {
      return;
    }

    cancelarReserva(reserva);
  }

  function cancelarReserva(reserva) {
    reserva.status = "cancelada";

    /*
     * Também registramos a data do cancelamento quando o
     * formato da reserva permitir esse tipo de informação.
     */
    reserva.canceladaEm = new Date().toISOString();

    salvarReservas();

    carregarReservas();

    aplicarFiltro();

    atualizarResumo();

    if (
      reservaSelecionada &&
      obterIdReserva(reservaSelecionada) === obterIdReserva(reserva)
    ) {
      fecharModal();
    }

    mostrarToast("Reserva cancelada com sucesso.", "sucesso");
  }

  function salvarReservas() {
    try {
      /*
       * Como o filtro por usuário acontece na leitura,
       * precisamos preservar as outras reservas que podem
       * existir no armazenamento.
       */
      const armazenadas = obterTodasReservasArmazenadas();

      const reservaAtualizadaIds = reservas.map((reserva) =>
        obterIdReserva(reserva),
      );

      const resultado = armazenadas.map((reserva) => {
        const id = obterIdReserva(reserva);

        const atualizada = reservas.find((item) => obterIdReserva(item) === id);

        if (atualizada && reservaAtualizadaIds.includes(id)) {
          return atualizada;
        }

        return reserva;
      });

      localStorage.setItem(CONFIG.STORAGE_RESERVAS, JSON.stringify(resultado));
    } catch (erro) {
      console.error("Erro ao salvar reservas:", erro);

      mostrarToast("Não foi possível salvar a alteração.", "erro");
    }
  }

  function obterTodasReservasArmazenadas() {
    try {
      const dados = localStorage.getItem(CONFIG.STORAGE_RESERVAS);

      if (!dados) {
        return [];
      }

      const reservasSalvas = JSON.parse(dados);

      return Array.isArray(reservasSalvas) ? reservasSalvas : [];
    } catch (erro) {
      console.error("Erro ao acessar reservas armazenadas:", erro);

      return [];
    }
  }

  function obterIdReserva(reserva) {
    return String(
      reserva?.id ?? reserva?.codigo ?? reserva?.codigoReserva ?? "",
    );
  }

  /* =========================================================
       MODAL
       ========================================================= */

  function abrirModal() {
    if (!elementos.modal) {
      return;
    }

    elementos.modal.classList.remove("hidden");

    elementos.modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    elementos.fecharModal?.focus();
  }

  function fecharModal() {
    if (!elementos.modal) {
      return;
    }

    elementos.modal.classList.add("hidden");

    elementos.modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    reservaSelecionada = null;
  }

  /* =========================================================
       EVENTOS
       ========================================================= */

  function configurarEventos() {
    elementos.filtroStatus?.addEventListener("change", aplicarFiltro);

    elementos.fecharModal?.addEventListener("click", fecharModal);

    document.addEventListener("click", tratarCliqueDocumento);

    document.addEventListener("keydown", tratarTecla);

    document.getElementById("btn-sair")?.addEventListener("click", sair);
  }

  function tratarCliqueDocumento(evento) {
    const botaoDetalhes = evento.target.closest("[data-ver-reserva]");

    if (botaoDetalhes) {
      abrirDetalhesReserva(botaoDetalhes.dataset.verReserva);

      return;
    }

    const botaoCancelar = evento.target.closest("[data-cancelar-reserva]");

    if (botaoCancelar) {
      solicitarCancelamento(botaoCancelar.dataset.cancelarReserva);

      return;
    }

    const botaoCancelarModal = evento.target.closest("[data-modal-cancelar]");

    if (botaoCancelarModal) {
      if (reservaSelecionada) {
        solicitarCancelamento(obterIdReserva(reservaSelecionada));
      }

      return;
    }

    const elementoFechar = evento.target.closest("[data-fechar-modal]");

    if (elementoFechar) {
      fecharModal();
    }
  }

  function tratarTecla(evento) {
    if (evento.key !== "Escape") {
      return;
    }

    if (elementos.modal && !elementos.modal.classList.contains("hidden")) {
      fecharModal();
    }
  }

  /* =========================================================
       LOGOUT
       ========================================================= */

  function sair() {
    sessionStorage.removeItem(CONFIG.STORAGE_TOKEN);

    /*
     * O usuário local não é apagado aqui.
     *
     * Isso evita destruir dados do perfil durante o logout.
     * A autenticação definitiva poderá assumir esse controle
     * quando o backend estiver integrado.
     */
    window.location.href = CONFIG.LOGIN_URL;
  }

  /* =========================================================
       DATAS
       ========================================================= */

  function formatarData(valor) {
    if (!valor) {
      return "Não informada";
    }

    /*
     * Datas já formatadas como texto devem ser preservadas.
     */
    if (typeof valor === "string" && valor.includes("/")) {
      return valor;
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
      return String(valor);
    }

    return data.toLocaleDateString("pt-BR");
  }

  /* =========================================================
       TOAST
       ========================================================= */

  function mostrarToast(mensagem, tipo = "info") {
    if (!elementos.toast) {
      return;
    }

    elementos.toast.textContent = mensagem;

    elementos.toast.className = "toast";

    elementos.toast.classList.add(`toast--${tipo}`);

    elementos.toast.classList.add("toast--visivel");

    window.clearTimeout(mostrarToast.timer);

    mostrarToast.timer = window.setTimeout(() => {
      elementos.toast?.classList.remove("toast--visivel");
    }, 3500);
  }

  /* =========================================================
       SEGURANÇA
       ========================================================= */

  function escapeHtml(valor) {
    return String(valor)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

  iniciar();
})();
