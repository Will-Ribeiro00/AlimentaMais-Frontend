const btnLogin = document.getElementById("btnDirecionaLogin");
const btnCadastro = document.getElementById("btnDirecionaCadastro");
const btnCadastroCta = document.getElementById("btnDirecionaCadastroCta");

btnLogin.addEventListener("click", () => {
  window.location.href = "./pags/loginECadastro/index.html?modo=login";
});

btnCadastro.addEventListener("click", () => {
  window.location.href = "./pags/loginECadastro/index.html?modo=cadastro";
});

btnCadastroCta.addEventListener("click", () => {
  window.location.href = "./pags/loginECadastro/index.html?modo=cadastro";
});
