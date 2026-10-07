document.addEventListener("DOMContentLoaded", () => {

  // Liga o clique de um botão a uma ação, só se o botão existir na página
  function ao(id, acao) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (evento) => {
        evento.preventDefault();
        acao();
      });
    }
  }

  function ir(url) {
    window.location.href = url;
  }

  // Menu lateral (existe em todas as telas do consumidor)
  ao("btnInicio",   () => ir("../consumidor/index.html"));
  ao("btnReservas", () => ir("../reservasConsumidor/index.html"));
  ao("btnPerfil",   () => ir("../perfilConsumidor/index.html"));

  ao("btnSair", () => {
    sessionStorage.removeItem("accessToken");
    ir("../loginECadastro/index.html");
  });

  // Tela de perfil (ignorados nas páginas que não têm esses botões)
  ao("btnSenha",   () => ir("../alterarsenhaConsumidor/index.html"));
  ao("btnEmail",   () => ir("../alterarEmailConsumidor/index.html"));
  ao("btnCelular", () => ir("../alterarCelularConsumidor/index.html"));
  ao("btnExcluir", () => ir("../excluircontaConsumidor/index.html"));

});
