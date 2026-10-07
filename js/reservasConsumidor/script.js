/* Tela "Minhas reservas" do consumidor.
   Lê as reservas gravadas pela home (localStorage). Para ligar ao backend,
   troque carregar() e salvar(). */
(function () {
  var CHAVE = "alimentaReservasConsumidor";
  var lista = document.getElementById("listaReservas");
  document.getElementById("dataAtual").textContent = new Date().toLocaleDateString("pt-BR");

  var EXEMPLO = [
    { produto: "Kit Padaria", estabelecimento: "Padaria São João", data: "28/09/2026", codigo: "#HE782B", status: "Aguardando retirada" },
    { produto: "Kit Frutas", estabelecimento: "Hortifruti Boa Safra", data: "27/09/2026", codigo: "#NVP417", status: "Retirada" },
    { produto: "Kit Danones", estabelecimento: "Mercado Bom Preço", data: "26/09/2026", codigo: "#LM643M", status: "Cancelada" }
  ];

  function carregar() {
    var dados = null;
    try { dados = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) {}
    if (!dados) { dados = EXEMPLO; salvar(dados); }
    return dados;
  }
  function salvar(dados) { localStorage.setItem(CHAVE, JSON.stringify(dados)); }

  function esc(t) {
    var d = document.createElement("div");
    d.textContent = t == null ? "" : String(t);
    return d.innerHTML;
  }
  function classe(status) {
    return status === "Retirada" ? "retirada" : status === "Cancelada" ? "cancelada" : "aguardando";
  }

  function desenhar() {
    var dados = carregar();
    if (!dados.length) {
      lista.innerHTML = '<p class="sem-reservas">Você ainda não tem reservas. <a href="../consumidor/index.html">Ver ofertas</a></p>';
      return;
    }
    lista.innerHTML = dados.map(function (r, i) {
      var cancelada = r.status === "Cancelada";
      var podeCancelar = r.status === "Aguardando retirada";
      return '<article class="reserva">' +
        '<div class="reserva__campo"><label>Produto</label><strong>' + esc(r.produto) + '</strong></div>' +
        '<div class="reserva__campo"><label>Estabelecimento</label><strong>' + esc(r.estabelecimento) + '</strong></div>' +
        '<div class="reserva__campo"><label>Data</label><strong>' + esc(r.data) + '</strong></div>' +
        '<div class="reserva__campo"><label>Código</label><strong>' + esc(r.codigo) + '</strong></div>' +
        '<div class="reserva__campo"><label>Status</label><span class="status ' + classe(r.status) + '">' + esc(r.status) + '</span></div>' +
        '<div class="reserva__acao"><button type="button" class="botao-cancelar" data-i="' + i + '"' +
          (podeCancelar ? '' : ' disabled') + '>' + (cancelada ? "Reserva cancelada" : "Cancelar reserva") + '</button></div>' +
      '</article>';
    }).join("");
  }

  lista.addEventListener("click", function (e) {
    var b = e.target.closest(".botao-cancelar");
    if (!b || b.disabled) return;
    if (!confirm("Deseja cancelar esta reserva?")) return;
    var dados = carregar();
    dados[Number(b.dataset.i)].status = "Cancelada";
    salvar(dados);
    desenhar();
  });

  /* Menu mobile */
  var side = document.getElementById("sidebar"), ov = document.getElementById("overlay"), mm = document.getElementById("mobileMenu");
  function fechar() { side.classList.remove("open"); ov.classList.remove("active"); mm.setAttribute("aria-expanded", "false"); }
  mm.addEventListener("click", function () {
    var aberto = side.classList.toggle("open");
    ov.classList.toggle("active", aberto);
    mm.setAttribute("aria-expanded", String(aberto));
  });
  ov.addEventListener("click", fechar);

  desenhar();
})();
