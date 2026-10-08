import { salvarToken } from "../api.js";
import { configurarTabs } from "./components/tabs.js";
import { login, registrarUsuario } from "./services/authService.js";
import {
  formatarCPF,
  cpfValido,
  formatarCNPJ,
  cnpjValido,
  emailValido,
  senhaValida,
} from "./utils/cadastroValidator.js";

function configurarNavegacaoPrincipal() {
  const tabEntrar = document.getElementById("tabEntrar");
  const tabCriar = document.getElementById("tabCriar");
  const loginForm = document.getElementById("loginForm");
  const painelCriarConta = document.getElementById("painelCriarConta");

  configurarTabs({
    tabAtiva: tabEntrar,
    tabInativa: tabCriar,
    aoAtivar: () => {
      loginForm.hidden = false;
      painelCriarConta.hidden = true;
    },
  });

  configurarTabs({
    tabAtiva: tabCriar,
    tabInativa: tabEntrar,
    aoAtivar: () => {
      loginForm.hidden = true;
      painelCriarConta.hidden = false;
    },
  });
}

function configurarLogin() {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const resultado = await login(email, password);

      salvarToken(resultado.accessToken, formData.get("remember") === "on");

      if (resultado.tipoUsuario === "consumidor") {
        window.location.href = "../consumidor/inicio/index.html";
      } else {
        window.location.href = "../estabelecimento/dashboard/index.html";
      }
    } catch (error) {
      alert(error.message);
    }
  });
}

function configurarCadastro() {
  const formConsumidor = document.getElementById("formConsumidor");
  const formEstabelecimento = document.getElementById("formEstabelecimento");
  const tabConsumidor = document.getElementById("tabConsumidor");
  const tabEstabelecimento = document.getElementById("tabEstabelecimento");

  configurarTabs({
    tabAtiva: tabConsumidor,
    tabInativa: tabEstabelecimento,
    aoAtivar: () => {
      formConsumidor.hidden = false;
      formEstabelecimento.hidden = true;
    },
  });

  configurarTabs({
    tabAtiva: tabEstabelecimento,
    tabInativa: tabConsumidor,
    aoAtivar: () => {
      formEstabelecimento.hidden = false;
      formConsumidor.hidden = true;
    },
  });

  const inputCpfConsumidor = formConsumidor.querySelector('input[name="cpf"]');
  inputCpfConsumidor.addEventListener("input", () => {
    inputCpfConsumidor.value = formatarCPF(inputCpfConsumidor.value);
  });

  const inputCpfResponsavel = formEstabelecimento.querySelector('input[name="cpfResponsavel"]');
  inputCpfResponsavel.addEventListener("input", () => {
    inputCpfResponsavel.value = formatarCPF(inputCpfResponsavel.value);
  });

  const inputCnpj = formEstabelecimento.querySelector('input[name="cnpj"]');
  inputCnpj.addEventListener("input", () => {
    inputCnpj.value = formatarCNPJ(inputCnpj.value);
  });

  formConsumidor.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(formConsumidor);
    const senha = formData.get("senha");
    const confirmarSenha = formData.get("confirmarSenha");

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }
    if (!emailValido(formData.get("email"))) {
      alert("Digite um e-mail válido.");
      return;
    }
    if (!cpfValido(formData.get("cpf"))) {
      alert("CPF inválido. Digite os 11 números.");
      return;
    }
    if (!senhaValida(senha)) {
      alert(
        "A senha precisa ter 8+ caracteres, com maiúscula, minúscula, número e caractere especial.",
      );
      return;
    }

    const dados = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      password: senha,
      cpf: formData.get("cpf"),
      tipoUsuario: "consumidor",
    };

    try {
      await registrarUsuario(dados);
      alert("Cadastro realizado com sucesso!");

      formConsumidor.reset();
      document.getElementById("tabEntrar").click();
    } catch (error) {
      alert(error.message);
    }
  });

  formEstabelecimento.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(formEstabelecimento);
    const senha = formData.get("senha");
    const confirmarSenha = formData.get("confirmarSenha");

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }
    if (!emailValido(formData.get("email"))) {
      alert("Digite um e-mail válido.");
      return;
    }
    if (!cpfValido(formData.get("cpfResponsavel"))) {
      alert("CPF do responsável inválido. Digite os 11 números.");
      return;
    }
    if (!cnpjValido(formData.get("cnpj"))) {
      alert("CNPJ inválido. Digite os 14 números.");
      return;
    }
    if (!senhaValida(senha)) {
      alert(
        "A senha precisa ter 8+ caracteres, com maiúscula, minúscula, número e caractere especial.",
      );
      return;
    }

    const dados = {
      nome: formData.get("nomeResponsavel"),
      email: formData.get("email"),
      password: senha,
      cpf: formData.get("cpfResponsavel"),
      tipoUsuario: "estabelecimento",
      nomeFantasia: formData.get("nomeFantasia"),
      cnpj: formData.get("cnpj"),
      categoria: formData.get("categoria"),
      endereco: formData.get("endereco"),
    };

    try {
      await registrarUsuario(dados);
      alert("Estabelecimento cadastrado com sucesso!");

      formEstabelecimento.reset();
      document.getElementById("tabEntrar").click();
    } catch (error) {
      alert(error.message);
    }
  });
}

function aplicarModoInicial() {
  const params = new URLSearchParams(window.location.search);
  const modo = params.get("modo");

  if (modo === "cadastro") {
    const tabCriar = document.getElementById("tabCriar");
    tabCriar.click();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  configurarNavegacaoPrincipal();
  configurarLogin();
  configurarCadastro();
  aplicarModoInicial();
});
