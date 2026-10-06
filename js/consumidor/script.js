document.addEventListener("DOMContentLoaded", () => {
 
  const btnPerfil = document.getElementById("btnPerfil");

  btnPerfil.addEventListener("click", () => {
    window.location.href = "../perfil/index.html";
  });

 
  const btnSair = document.getElementById("btnSair");

  btnSair.addEventListener("click", () => {
    sessionStorage.removeItem("accessToken");

    window.location.href = "../loginECadastro/index.html";
  });

});