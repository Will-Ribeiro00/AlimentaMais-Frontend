// Telas "Alterar ..." e "Excluir conta" dos dois tipos de usuário.
// O atributo data-alterar do formulário diz qual dado a tela altera.
import { chamarApi, sair } from "./api.js";
import { CATEGORIAS_ESTABELECIMENTO } from "./formatar.js";
import { autorizado, mostrarMensagem, perfil } from "./painel.js";

const formulario = document.querySelector("[data-alterar]");
const acao = formulario.dataset.alterar;
const mensagem = formulario.querySelector(".mensagem");
const botao = formulario.querySelector('button[type="submit"]');
const valorAtual = formulario.querySelector("[data-valor-atual]");

// Onde está o valor atual de cada dado dentro do JSON de /api/perfil
const VALOR_ATUAL = {
  email: (u) => u.email,
  celular: (u) => u.celular || "Não informado",
  nomeFantasia: (u) => u.estabelecimento?.nomeFantasia,
  endereco: (u) => u.estabelecimento?.endereco,
  categoria: (u) =>
    CATEGORIAS_ESTABELECIMENTO[u.estabelecimento?.categoria] ?? u.estabelecimento?.categoria,
};

if (valorAtual && VALOR_ATUAL[acao]) {
  perfil.then((usuario) => (valorAtual.value = VALOR_ATUAL[acao](usuario) ?? "")).catch(() => {});
}

// (11) 99999-9999 enquanto digita
const campoCelular = formulario.querySelector('input[name="celular"]');
campoCelular?.addEventListener("input", () => {
  const d = campoCelular.value.replace(/\D/g, "").slice(0, 11);
  campoCelular.value =
    d.length > 10
      ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
      : d.length > 6
        ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
        : d.length > 2
          ? `(${d.slice(0, 2)}) ${d.slice(2)}`
          : d;
});

function enviar(dados) {
  if (acao === "senha") {
    if (dados.novaSenha !== dados.confirmarSenha) throw new Error("As senhas não coincidem.");
    return chamarApi("/api/perfil/senha", {
      metodo: "PATCH",
      corpo: { senhaAtual: dados.senhaAtual, novaSenha: dados.novaSenha },
    });
  }

  if (acao === "excluir") return chamarApi("/api/perfil", { metodo: "DELETE" });

  return chamarApi("/api/perfil", { metodo: "PATCH", corpo: { [acao]: dados[acao] } });
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!autorizado) return;

  const dados = Object.fromEntries(new FormData(formulario));
  mostrarMensagem(mensagem, "");
  botao.disabled = true;

  try {
    const resultado = await Promise.resolve().then(() => enviar(dados));

    if (acao === "excluir") {
      sair();
      alert("Sua conta foi excluída.");
      window.location.replace("../../../index.html");
      return;
    }

    mostrarMensagem(mensagem, resultado?.mensagem || "Dados atualizados.", "sucesso");
    setTimeout(() => window.location.assign("../perfil/index.html"), 1200);
  } catch (erro) {
    mostrarMensagem(mensagem, erro.message);
    botao.disabled = false;
  }
});
