document.addEventListener("DOMContentLoaded", () => {

  const btnInicio = document.getElementById("btnInicio");
  const btnReservas = document.getElementById("btnReservas");
  const btnPerfil = document.getElementById("btnPerfil");


  // Ir para a página inicial do consumidor
  btnInicio.addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "../consumidor/index.html";
  });


  // Ir para minhas reservas
  btnReservas.addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "../reservas/index.html";
  });


  // Ir para o perfil
  btnPerfil.addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "../perfil/index.html";
  });

});