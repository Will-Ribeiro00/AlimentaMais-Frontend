// Comum a todas as telas logadas: proteção da página, nome do usuário, menu mobile, data atual e sair.
import { chamarApi, dadosDoToken, irParaLogin, sair } from "./api.js";

const INICIO = {
  consumidor: "../../consumidor/inicio/index.html",
  estabelecimento: "../../estabelecimento/dashboard/index.html",
};

const area = document.body.dataset.area;
const sessao = dadosDoToken();

// true quando o usuário logado pode ver esta página
export const autorizado = Boolean(sessao) && sessao.tipoUsuario === area;

if (!sessao) {
  irParaLogin();
} else if (!autorizado) {
  window.location.replace(INICIO[sessao.tipoUsuario] ?? INICIO.consumidor);
}

// Dados do usuário logado (GET /api/perfil), compartilhados com o script de cada tela
export const perfil = autorizado ? chamarApi("/api/perfil") : new Promise(() => {});

perfil
  .then((usuario) => {
    const nome = usuario.estabelecimento?.nomeFantasia ?? usuario.nome;
    document
      .querySelectorAll("[data-saudacao]")
      .forEach((el) => (el.textContent = `Olá, ${nome}!`));
    document
      .querySelectorAll("[data-nome-estabelecimento]")
      .forEach((el) => (el.textContent = nome));
  })
  .catch(() => {
    // Sem os dados do perfil a saudação fica só "Olá!"
  });

// ---------- Menu mobile ----------

const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");
const botaoMenu = document.querySelector(".botao-menu");

function alternarMenu(aberto) {
  sidebar.classList.toggle("sidebar--aberta", aberto);
  overlay.classList.toggle("overlay--ativa", aberto);
  botaoMenu.setAttribute("aria-expanded", String(aberto));
}

if (sidebar && overlay && botaoMenu) {
  botaoMenu.addEventListener("click", () =>
    alternarMenu(!sidebar.classList.contains("sidebar--aberta")),
  );
  overlay.addEventListener("click", () => alternarMenu(false));
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") alternarMenu(false);
  });
}

// ---------- Data atual e sair ----------

document.querySelectorAll("[data-data-atual]").forEach((elemento) => {
  elemento.textContent = new Date().toLocaleDateString("pt-BR");
});

document.querySelectorAll("[data-sair]").forEach((link) => link.addEventListener("click", sair));

// ---------- Mensagens de formulário ----------

export function mostrarMensagem(elemento, texto, tipo = "erro") {
  elemento.textContent = texto;
  elemento.className = `mensagem mensagem--${tipo}`;
  elemento.hidden = !texto;
}
