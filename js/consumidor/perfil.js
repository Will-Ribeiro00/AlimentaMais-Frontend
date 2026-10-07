/* =========================================================
   ALIMENTA+ | PERFIL DO CONSUMIDOR
   ---------------------------------------------------------
   Responsabilidades desta página:
   - Validar a sessão do consumidor;
   - Carregar os dados atuais do usuário;
   - Preencher o perfil;
   - Permitir atualização dos dados pessoais;
   - Exibir indicadores das reservas;
   - Preparar a ação de alteração de senha;
   - Fazer logout;
   - Exibir feedback visual das ações.

   REGRA DE PROJETO:
   - Não duplicar regras de negócio desnecessariamente;
   - Preservar os dados já existentes no localStorage;
   - Não apagar informações que não pertençam ao formulário;
   - Manter a página independente das demais telas do consumidor;
========================================================= */

(function () {
  "use strict";

  /* =====================================================
       CONFIGURAÇÕES
    ====================================================== */

  const CONFIG = {
    LOGIN_URL: "../loginECadastro/index.html",

    STORAGE_USUARIO: "alimentaUsuario",
    STORAGE_RESERVAS: "alimentaReservas",
    STORAGE_TOKEN: "accessToken",
  };

  /* =====================================================
       ESTADO DA PÁGINA
    ====================================================== */

  let usuarioAtual = null;

  /* =====================================================
       ELEMENTOS DA INTERFACE
    ====================================================== */

  const elementos = {
    formPerfil: document.getElementById("form-perfil"),

    nome: document.getElementById("nome"),
    email: document.getElementById("email"),
    telefone: document.getElementById("telefone"),
    cpf: document.getElementById("cpf"),

    perfilNome: document.getElementById("perfil-nome"),
    perfilEmail: document.getElementById("perfil-email"),
    avatarInicial: document.getElementById("avatar-inicial"),

    totalReservas: document.getElementById("perfil-total-reservas"),
    totalConcluidas: document.getElementById("perfil-total-concluidas"),

    btnSalvarPerfil: document.getElementById("btn-salvar-perfil"),
    btnAlterarSenha: document.getElementById("btn-alterar-senha"),
    btnSair: document.getElementById("btn-sair"),

    toast: document.getElementById("toast"),
  };

  /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

  function iniciar() {
    const sessaoValida = validarSessao();

    if (!sessaoValida) {
      return;
    }

    usuarioAtual = carregarUsuario();

    if (!usuarioAtual) {
      mostrarToast("Não foi possível carregar os dados da sua conta.", "erro");

      return;
    }

    preencherPerfil();
    atualizarIndicadores();
    configurarEventos();
  }

  /* =====================================================
       SESSÃO
    ====================================================== */

  function validarSessao() {
    const token = sessionStorage.getItem(CONFIG.STORAGE_TOKEN);
    const usuario = localStorage.getItem(CONFIG.STORAGE_USUARIO);

    /*
     * O projeto atual utiliza accessToken em sessionStorage
     * durante o fluxo de login.
     *
     * Mantemos também a verificação do usuário salvo para
     * evitar que uma página protegida seja carregada sem
     * qualquer identificação da conta.
     */
    if (!token && !usuario) {
      redirecionarLogin();
      return false;
    }

    return true;
  }

  function redirecionarLogin() {
    window.location.href = CONFIG.LOGIN_URL;
  }

  /* =====================================================
       USUÁRIO
    ====================================================== */

  function carregarUsuario() {
    try {
      const dados = localStorage.getItem(CONFIG.STORAGE_USUARIO);

      if (!dados) {
        return null;
      }

      const usuario = JSON.parse(dados);

      if (!usuario || typeof usuario !== "object") {
        return null;
      }

      return usuario;
    } catch (erro) {
      console.error("Alimenta+ | Erro ao carregar usuário:", erro);

      return null;
    }
  }

  function salvarUsuario(usuario) {
    try {
      localStorage.setItem(CONFIG.STORAGE_USUARIO, JSON.stringify(usuario));

      return true;
    } catch (erro) {
      console.error("Alimenta+ | Erro ao salvar usuário:", erro);

      return false;
    }
  }

  /* =====================================================
       PREENCHIMENTO DO PERFIL
    ====================================================== */

  function preencherPerfil() {
    const nome = obterValor(
      usuarioAtual.nome,
      usuarioAtual.nomeCompleto,
      usuarioAtual.name,
    );

    const email = obterValor(usuarioAtual.email);

    const telefone = obterValor(
      usuarioAtual.telefone,
      usuarioAtual.celular,
      usuarioAtual.phone,
    );

    const cpf = obterValor(usuarioAtual.cpf);

    elementos.nome.value = nome;
    elementos.email.value = email;
    elementos.telefone.value = telefone;
    elementos.cpf.value = cpf;

    elementos.perfilNome.textContent = nome || "Usuário";

    elementos.perfilEmail.textContent = email || "E-mail não informado";

    elementos.avatarInicial.textContent = obterInicial(nome);
  }

  /* =====================================================
       VALORES ALTERNATIVOS
    ====================================================== */

  function obterValor() {
    const valores = Array.from(arguments);

    const valorEncontrado = valores.find(function (valor) {
      return (
        valor !== undefined && valor !== null && String(valor).trim() !== ""
      );
    });

    return valorEncontrado ? String(valorEncontrado) : "";
  }

  function obterInicial(nome) {
    const nomeNormalizado = String(nome || "").trim();

    if (!nomeNormalizado) {
      return "U";
    }

    return nomeNormalizado.charAt(0).toUpperCase();
  }

  /* =====================================================
       EVENTOS
    ====================================================== */

  function configurarEventos() {
    if (elementos.formPerfil) {
      elementos.formPerfil.addEventListener("submit", salvarPerfil);
    }

    if (elementos.btnAlterarSenha) {
      elementos.btnAlterarSenha.addEventListener("click", alterarSenha);
    }

    if (elementos.btnSair) {
      elementos.btnSair.addEventListener("click", sair);
    }
  }

  /* =====================================================
       SALVAR PERFIL
    ====================================================== */

  function salvarPerfil(evento) {
    evento.preventDefault();

    const nome = elementos.nome.value.trim();
    const email = elementos.email.value.trim();
    const telefone = elementos.telefone.value.trim();
    const cpf = elementos.cpf.value.trim();

    /*
     * Nome e e-mail são os campos mínimos necessários
     * para esta atualização.
     */
    if (!nome) {
      mostrarToast("Informe seu nome completo.", "erro");

      elementos.nome.focus();
      return;
    }

    if (!email) {
      mostrarToast("Informe seu e-mail.", "erro");

      elementos.email.focus();
      return;
    }

    if (!emailValido(email)) {
      mostrarToast("Informe um e-mail válido.", "erro");

      elementos.email.focus();
      return;
    }

    /*
     * Preservamos todas as propriedades existentes do usuário.
     *
     * Isso é importante porque o objeto pode conter outros
     * dados utilizados pelo fluxo de autenticação ou pelas
     * demais páginas.
     */
    const usuarioAtualizado = {
      ...usuarioAtual,

      nome: nome,
      email: email,
      telefone: telefone,
      cpf: cpf,
    };

    const salvo = salvarUsuario(usuarioAtualizado);

    if (!salvo) {
      mostrarToast("Não foi possível salvar as alterações.", "erro");

      return;
    }

    usuarioAtual = usuarioAtualizado;

    preencherPerfil();
    atualizarIndicadores();

    mostrarToast("Perfil atualizado com sucesso.", "sucesso");
  }

  /* =====================================================
       VALIDAÇÃO DE E-MAIL
    ====================================================== */

  function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* =====================================================
       INDICADORES DE RESERVAS
    ====================================================== */

  function atualizarIndicadores() {
    const reservas = carregarReservasDoUsuario();

    const total = reservas.length;

    const concluidas = reservas.filter(function (reserva) {
      const status = normalizarStatus(reserva.status);

      return status === "concluida";
    }).length;

    elementos.totalReservas.textContent = total;
    elementos.totalConcluidas.textContent = concluidas;
  }

  function carregarReservasDoUsuario() {
    try {
      const dados = localStorage.getItem(CONFIG.STORAGE_RESERVAS);

      if (!dados) {
        return [];
      }

      const reservas = JSON.parse(dados);

      if (!Array.isArray(reservas)) {
        return [];
      }

      return reservas.filter(reservaPertenceAoUsuario);
    } catch (erro) {
      console.error("Alimenta+ | Erro ao carregar reservas:", erro);

      return [];
    }
  }

  function reservaPertenceAoUsuario(reserva) {
    if (!reserva || typeof reserva !== "object") {
      return false;
    }

    const usuarioId = obterIdUsuario();

    /*
     * Se a reserva possui um identificador de usuário,
     * fazemos a filtragem normalmente.
     */
    if (reserva.usuarioId !== undefined && reserva.usuarioId !== null) {
      return String(reserva.usuarioId) === String(usuarioId);
    }

    if (reserva.userId !== undefined && reserva.userId !== null) {
      return String(reserva.userId) === String(usuarioId);
    }

    if (reserva.consumidorId !== undefined && reserva.consumidorId !== null) {
      return String(reserva.consumidorId) === String(usuarioId);
    }

    /*
     * Compatibilidade com estruturas antigas.
     *
     * Se a reserva não possui identificação de usuário,
     * não assumimos que ela pertence ao usuário atual.
     */
    return false;
  }

  function obterIdUsuario() {
    return obterValor(
      usuarioAtual && usuarioAtual.id,
      usuarioAtual && usuarioAtual.usuarioId,
      usuarioAtual && usuarioAtual.userId,
      usuarioAtual && usuarioAtual.email,
    );
  }

  /* =====================================================
       NORMALIZAÇÃO DE STATUS
    ====================================================== */

  function normalizarStatus(status) {
    const valor = String(status || "")
      .trim()
      .toLowerCase();

    const mapa = {
      pendente: "pendente",
      pending: "pendente",

      confirmada: "confirmada",
      confirmado: "confirmada",
      confirmed: "confirmada",

      concluida: "concluida",
      concluído: "concluida",
      concluido: "concluida",
      completed: "concluida",

      cancelada: "cancelada",
      cancelado: "cancelada",
      cancelled: "cancelada",
    };

    return mapa[valor] || valor;
  }

  /* =====================================================
       ALTERAÇÃO DE SENHA
    ====================================================== */

  function alterarSenha() {
    /*
     * O repositório atual possui uma estrutura própria para
     * login/cadastro e páginas relacionadas à conta.
     *
     * Como ainda não temos um fluxo de alteração de senha
     * conectado a uma API/backend neste módulo, não criamos
     * uma falsa alteração de senha apenas visual.
     *
     * O usuário recebe um feedback claro até que o fluxo
     * definitivo seja conectado.
     */
    mostrarToast(
      "A alteração de senha será integrada ao fluxo de segurança da conta.",
      "info",
    );
  }

  /* =====================================================
       LOGOUT
    ====================================================== */

  function sair() {
    sessionStorage.removeItem(CONFIG.STORAGE_TOKEN);

    /*
     * O usuário é removido apenas da sessão atual.
     *
     * Os dados persistidos da conta não são apagados aqui.
     */
    window.location.href = CONFIG.LOGIN_URL;
  }

  /* =====================================================
       TOAST
    ====================================================== */

  function mostrarToast(mensagem, tipo) {
    if (!elementos.toast) {
      return;
    }

    elementos.toast.textContent = mensagem;

    elementos.toast.classList.remove("sucesso", "erro", "info", "mostrar");

    if (tipo) {
      elementos.toast.classList.add(tipo);
    }

    /*
     * Força uma nova aplicação da classe para que mensagens
     * consecutivas também sejam percebidas visualmente.
     */
    requestAnimationFrame(function () {
      elementos.toast.classList.add("mostrar");
    });

    window.clearTimeout(mostrarToast.timer);

    mostrarToast.timer = window.setTimeout(function () {
      elementos.toast.classList.remove("mostrar");
    }, 3500);
  }

  /* =====================================================
       TECLA ESC
    ====================================================== */

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      elementos.toast.classList.remove("mostrar");
    }
  });

  /* =====================================================
       INICIAR PÁGINA
    ====================================================== */

  iniciar();
})();
