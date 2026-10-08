// Consumidor - Início: ofertas de hoje (GET /api/ofertas), busca, categorias e reserva (POST /api/reservas).
import { chamarApi } from "../api.js";
import { CATEGORIAS_OFERTA, escapar, moeda } from "../formatar.js";
import { autorizado, mostrarMensagem } from "../painel.js";

const $ = (id) => document.getElementById(id);

const lista = $("listaOfertas");
const campoBusca = $("campoBusca");
const botoesCategoria = document.querySelectorAll(".categoria");
const modalOferta = $("modalOferta");
const modalConfirmada = $("modalConfirmada");
const botaoReservar = $("btnConfirmarReserva");
const mensagemReserva = $("mensagemReserva");

let ofertas = [];
let categoriaAtual = "todos";
let ofertaAberta = null;

// Ícone verde da categoria (imagens/icones/categoria_<nome>_verde.svg)
const chaveCategoria = (categoria) => (CATEGORIAS_OFERTA[categoria] ? categoria : "outros");
const icone = (categoria) =>
  `../../../imagens/icones/${CATEGORIAS_OFERTA[chaveCategoria(categoria)].icone}_verde.svg`;
const classeIcone = (categoria) => `icone-categoria icone-categoria--${chaveCategoria(categoria)}`;
const horarioFim = (oferta) => oferta.horarioRetirada ?? oferta.estabelecimento.horarioFimRetirada;
const retirada = (oferta) =>
  `Hoje, das ${oferta.estabelecimento.horarioInicioRetirada} às ${horarioFim(oferta)}`;

// ---------- Lista ----------

function filtrar() {
  const termo = campoBusca.value.trim().toLowerCase();

  return ofertas.filter((oferta) => {
    const texto = `${oferta.nomeProduto} ${oferta.descricao ?? ""} ${oferta.estabelecimento.nomeFantasia}`;
    return (
      (categoriaAtual === "todos" || oferta.categoria === categoriaAtual) &&
      texto.toLowerCase().includes(termo)
    );
  });
}

function renderizar() {
  const visiveis = filtrar();

  if (!visiveis.length) {
    lista.innerHTML = `<p class="vazio">${
      ofertas.length
        ? "Nenhuma oferta encontrada."
        : "Nenhuma oferta disponível hoje. Volte mais tarde!"
    }</p>`;
    return;
  }

  lista.innerHTML = visiveis
    .map(
      (oferta) => `
        <article class="oferta" tabindex="0" role="button" data-id="${oferta.id}">
          <div class="oferta__icone">
            <img class="${classeIcone(oferta.categoria)}" src="${icone(oferta.categoria)}" alt="" />
          </div>
          <div class="oferta__corpo">
            <div class="oferta__nome">
              <strong>${escapar(oferta.nomeProduto)}:</strong>
              <small>Retirada até as ${escapar(horarioFim(oferta))}</small>
            </div>
            <p class="oferta__descricao">${escapar(oferta.descricao ?? "")}</p>
            <div class="oferta__preco">
              <span class="oferta__preco-novo">${moeda(oferta.precoAlimentaMais)}</span>
              <s class="oferta__preco-antigo">${moeda(oferta.precoOriginal)}</s>
            </div>
          </div>
        </article>`,
    )
    .join("");
}

async function carregarOfertas() {
  try {
    ofertas = await chamarApi("/api/ofertas", { autenticado: false });
    renderizar();
  } catch (erro) {
    lista.innerHTML = `<p class="vazio">${escapar(erro.message)}</p>`;
  }
}

botoesCategoria.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesCategoria.forEach((outro) => {
      outro.classList.toggle("categoria--ativa", outro === botao);
      outro.setAttribute("aria-pressed", String(outro === botao));
    });
    categoriaAtual = botao.dataset.categoria;
    renderizar();
  });
});

campoBusca.addEventListener("input", renderizar);

// ---------- Modais ----------

const abrir = (modal) => modal.classList.add("modal--aberto");
const fechar = (modal) => modal.classList.remove("modal--aberto");

function abrirOferta(id) {
  ofertaAberta = ofertas.find((oferta) => oferta.id === Number(id));
  if (!ofertaAberta) return;

  const o = ofertaAberta;
  $("ofertaIcone").src = icone(o.categoria);
  $("ofertaIcone").className = classeIcone(o.categoria);
  $("ofertaTitulo").textContent = o.nomeProduto;
  $("ofertaDescricao").textContent = o.descricao ?? "";
  $("ofertaOriginal").textContent = moeda(o.precoOriginal);
  $("ofertaPreco").textContent = moeda(o.precoAlimentaMais);
  $("ofertaDesconto").textContent = `${o.desconto}%`;
  $("ofertaEstabelecimento").textContent = o.estabelecimento.nomeFantasia;
  $("ofertaEndereco").textContent = o.estabelecimento.endereco;
  $("ofertaRetirada").textContent = retirada(o);
  $("ofertaEstoque").textContent =
    `Restam ${o.quantidade} ${o.quantidade === 1 ? "unidade" : "unidades"}!`;
  mostrarMensagem(mensagemReserva, "");
  botaoReservar.disabled = false;
  abrir(modalOferta);
}

lista.addEventListener("click", (evento) => {
  const card = evento.target.closest(".oferta");
  if (card) abrirOferta(card.dataset.id);
});

lista.addEventListener("keydown", (evento) => {
  const card = evento.target.closest(".oferta");
  if (card && (evento.key === "Enter" || evento.key === " ")) {
    evento.preventDefault();
    abrirOferta(card.dataset.id);
  }
});

botaoReservar.addEventListener("click", async () => {
  if (!ofertaAberta) return;
  botaoReservar.disabled = true;

  try {
    const { reserva } = await chamarApi("/api/reservas", {
      metodo: "POST",
      corpo: { ofertaId: ofertaAberta.id },
    });

    $("confCodigo").textContent = `#${reserva.codigo}`;
    $("confEstabelecimento").textContent = reserva.estabelecimento;
    $("confEndereco").textContent = reserva.endereco;
    $("confRetirada").textContent = retirada(ofertaAberta);

    fechar(modalOferta);
    abrir(modalConfirmada);
    carregarOfertas(); // atualiza o estoque mostrado
  } catch (erro) {
    mostrarMensagem(mensagemReserva, erro.message);
    botaoReservar.disabled = false;
  }
});

[modalOferta, modalConfirmada].forEach((modal) => {
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal || evento.target.closest("[data-fechar]")) fechar(modal);
  });
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    fechar(modalOferta);
    fechar(modalConfirmada);
  }
});

if (autorizado) carregarOfertas();
