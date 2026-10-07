/* Modais da home do consumidor: detalhes da oferta e reserva confirmada.
   As reservas ficam em localStorage (chave abaixo) e são lidas pela tela
   "Minhas reservas". Para ligar ao backend, troque salvarReserva(). */
(function () {
  var CHAVE = "alimentaReservasConsumidor";
  var $ = function (id) { return document.getElementById(id); };
  var moeda = function (v) {
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  var modalOferta = $("modalOferta");
  var modalOk = $("modalConfirmada");
  if (!modalOferta || !modalOk) return;

  var atual = null; // <article> da oferta aberta

  function abrir(m) { m.classList.add("active"); }
  function fechar(m) { m.classList.remove("active"); }

  function atualizarEstoque() {
    var n = Number(atual.dataset.estoque);
    var txt = $("ofertaEstoque");
    var btn = $("btnConfirmarReserva");
    if (n > 0) {
      txt.textContent = "Restam " + n + (n === 1 ? " unidade!" : " unidades!");
      btn.disabled = false;
    } else {
      txt.textContent = "Oferta esgotada.";
      btn.disabled = true;
    }
  }

  function abrirOferta(art) {
    atual = art;
    var d = art.dataset;
    var desconto = Math.round((1 - Number(d.preco) / Number(d.original)) * 100);

    $("ofertaIcone").className = art.querySelector(".oferta__icone i").className;
    $("ofertaTitulo").textContent = d.nome;
    $("ofertaDescricao").textContent = d.descricao;
    $("ofertaOriginal").textContent = moeda(d.original);
    $("ofertaPreco").textContent = moeda(d.preco);
    $("ofertaDesconto").textContent = desconto + "%";
    $("ofertaEstabelecimento").textContent = d.estabelecimento;
    $("ofertaEndereco").textContent = d.endereco;
    $("ofertaRetirada").textContent = d.retirada;
    atualizarEstoque();
    abrir(modalOferta);
  }

  function gerarCodigo() {
    var c = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789", r = "";
    for (var i = 0; i < 6; i++) r += c.charAt(Math.floor(Math.random() * c.length));
    return "#" + r;
  }

  function salvarReserva(reserva) {
    var lista = [];
    try { lista = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (e) {}
    lista.unshift(reserva);
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  }

  function reservar() {
    if (!atual || Number(atual.dataset.estoque) <= 0) return;
    var d = atual.dataset;
    var codigo = gerarCodigo();

    salvarReserva({
      produto: d.nome,
      estabelecimento: d.estabelecimento,
      endereco: d.endereco,
      retirada: d.retirada,
      data: new Date().toLocaleDateString("pt-BR"),
      codigo: codigo,
      status: "Aguardando retirada"
    });

    atual.dataset.estoque = String(Number(d.estoque) - 1);

    $("confCodigo").textContent = codigo;
    $("confEstabelecimento").textContent = d.estabelecimento;
    $("confEndereco").textContent = d.endereco;
    $("confRetirada").textContent = d.retirada;

    fechar(modalOferta);
    abrir(modalOk);
  }

  // Clique (ou Enter) em qualquer oferta abre os detalhes
  document.querySelectorAll(".oferta").forEach(function (art) {
    art.tabIndex = 0;
    art.setAttribute("role", "button");
    art.addEventListener("click", function () { abrirOferta(art); });
    art.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirOferta(art); }
    });
  });

  $("btnConfirmarReserva").addEventListener("click", reservar);
  $("fecharOferta").addEventListener("click", function () { fechar(modalOferta); });
  $("fecharConfirmada").addEventListener("click", function () { fechar(modalOk); });

  [modalOferta, modalOk].forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m) fechar(m); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { fechar(modalOferta); fechar(modalOk); }
  });
})();
