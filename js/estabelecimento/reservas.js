// Estabelecimento - Reservas: GET /api/estabelecimento/reservas (agrupadas por oferta),
// alterar status e cancelar (PATCH /api/estabelecimento/reservas/{id}/status).
import { chamarApi } from "../api.js";
import {
  CATEGORIAS_OFERTA,
  STATUS_RESERVA,
  data,
  escapar,
  hora,
  moeda,
  selo,
} from "../formatar.js";
import { autorizado, mostrarMensagem, perfil } from "../painel.js";

const $ = (id) => document.getElementById(id);

const container = $("gruposReservas");
const botaoVerMais = $("verMais");
const modalStatus = $("modalStatus");
const selectStatus = $("novoStatus");
const botaoSalvarStatus = $("salvarStatus");
const mensagemStatus = $("mensagemStatus");

const GRUPOS_POR_VEZ = 10;

let grupos = [];
let quantidadeVisivel = GRUPOS_POR_VEZ;
let horarioPadrao = "—";
let reservaSelecionada = null;
const gruposAbertos = new Set();

// Oferta sem horário próprio usa o horário de retirada do estabelecimento
perfil
  .then((usuario) => (horarioPadrao = usuario.estabelecimento?.horarioFimRetirada ?? horarioPadrao))
  .catch(() => {});

const buscarReserva = (id) =>
  grupos.flatMap((grupo) => grupo.reservas).find((reserva) => reserva.id === Number(id));

// ---------- Lista ----------

const item = (rotulo, valor) => `<div><dt>${rotulo}</dt><dd>${valor}</dd></div>`;

function cartaoReserva(reserva) {
  const cancelada = reserva.status === "cancelada";

  return `
    <article class="reserva-cliente">
      <dl class="reserva-cliente__dados">
        ${item("Nome", escapar(reserva.nomeCliente))}
        ${item("Data Reserva", `${data(reserva.dataReserva)} ${hora(reserva.dataReserva)}`)}
        ${item("Código", `#${reserva.codigo}`)}
        ${item("Status", selo(STATUS_RESERVA, reserva.status))}
      </dl>
      <div class="reserva-cliente__acoes">
        <button type="button" class="botao botao--verde botao--pequeno" data-status-id="${reserva.id}">Alterar status</button>
        <button type="button" class="botao botao--laranja botao--pequeno" data-cancelar-id="${reserva.id}" ${cancelada ? "disabled" : ""}>
          ${cancelada ? "Reserva cancelada" : "Cancelar reserva"}
        </button>
      </div>
    </article>`;
}

function grupoOferta({ oferta, reservas }) {
  const id = String(oferta.id);
  const aberto = gruposAbertos.has(id);
  const nome = escapar(oferta.nomeProduto);
  const categoria = CATEGORIAS_OFERTA[oferta.categoria]?.texto ?? oferta.categoria;

  return `
    <article class="cartao grupo-reserva">
      <header class="grupo-reserva__cabecalho" data-grupo="${id}">
        <div>
          <h2 class="grupo-reserva__titulo">${nome}</h2>
          <p class="grupo-reserva__info">
            Publicada em ${data(oferta.dataPublicacao)} · ${reservas.length} ${reservas.length === 1 ? "reserva" : "reservas"}
          </p>
        </div>
        <button type="button" class="grupo-reserva__alternar" aria-expanded="${aberto}" aria-label="Mostrar ou esconder reservas de ${nome}">
          <i class="fa-solid ${aberto ? "fa-minus" : "fa-plus"}"></i>
        </button>
      </header>
      <div class="grupo-reserva__conteudo" ${aberto ? "" : "hidden"}>
        <dl class="resumo-oferta">
          ${item("Produto", escapar(oferta.descricao || oferta.nomeProduto))}
          ${item("R$ original", moeda(oferta.precoOriginal))}
          ${item("R$ Alimenta+", moeda(oferta.precoAlimentaMais))}
          ${item("Qtd.", `${oferta.quantidade} un.`)}
          ${item("Categoria", escapar(categoria))}
          ${item("Retirada até", escapar(oferta.horarioRetirada ?? horarioPadrao))}
        </dl>
        <div class="grupo-reserva__lista">
          ${reservas.map(cartaoReserva).join("")}
        </div>
      </div>
    </article>`;
}

function renderizar() {
  if (!grupos.length) {
    container.innerHTML = `<p class="cartao vazio">Nenhuma reserva recebida ainda.</p>`;
    botaoVerMais.hidden = true;
    return;
  }

  container.innerHTML = grupos.slice(0, quantidadeVisivel).map(grupoOferta).join("");
  botaoVerMais.hidden = quantidadeVisivel >= grupos.length;
}

async function carregar() {
  try {
    grupos = await chamarApi("/api/estabelecimento/reservas");
    await perfil.catch(() => {});

    // Na primeira carga, deixa aberta a oferta mais recente
    if (!gruposAbertos.size && grupos.length) gruposAbertos.add(String(grupos[0].oferta.id));
    renderizar();
  } catch (erro) {
    container.innerHTML = `<p class="cartao vazio">${escapar(erro.message)}</p>`;
  }
}

botaoVerMais.addEventListener("click", () => {
  quantidadeVisivel += GRUPOS_POR_VEZ;
  renderizar();
});

container.addEventListener("click", (evento) => {
  const botaoStatus = evento.target.closest("[data-status-id]");
  if (botaoStatus) {
    abrirModalStatus(botaoStatus.dataset.statusId);
    return;
  }

  const botaoCancelar = evento.target.closest("[data-cancelar-id]");
  if (botaoCancelar) {
    cancelarReserva(botaoCancelar);
    return;
  }

  const cabecalho = evento.target.closest("[data-grupo]");
  if (cabecalho) {
    const id = cabecalho.dataset.grupo;
    gruposAbertos.has(id) ? gruposAbertos.delete(id) : gruposAbertos.add(id);
    renderizar();
  }
});

// ---------- Alterar status e cancelar ----------

const alterarStatus = (id, status) =>
  chamarApi(`/api/estabelecimento/reservas/${id}/status`, { metodo: "PATCH", corpo: { status } });

function abrirModalStatus(id) {
  reservaSelecionada = buscarReserva(id);
  if (!reservaSelecionada) return;

  $("reservaSelecionada").textContent =
    `${reservaSelecionada.nomeCliente} - #${reservaSelecionada.codigo}`;
  selectStatus.value = reservaSelecionada.status;
  mostrarMensagem(mensagemStatus, "");
  botaoSalvarStatus.disabled = false;
  modalStatus.classList.add("modal--aberto");
  selectStatus.focus();
}

function fecharModalStatus() {
  modalStatus.classList.remove("modal--aberto");
  reservaSelecionada = null;
}

modalStatus.addEventListener("click", (evento) => {
  if (evento.target === modalStatus || evento.target.closest("[data-fechar]")) fecharModalStatus();
});

botaoSalvarStatus.addEventListener("click", async () => {
  botaoSalvarStatus.disabled = true;
  try {
    await alterarStatus(reservaSelecionada.id, selectStatus.value);
    fecharModalStatus();
    await carregar();
  } catch (erro) {
    mostrarMensagem(mensagemStatus, erro.message);
    botaoSalvarStatus.disabled = false;
  }
});

async function cancelarReserva(botao) {
  const reserva = buscarReserva(botao.dataset.cancelarId);
  if (!reserva || !confirm(`Cancelar a reserva #${reserva.codigo} de ${reserva.nomeCliente}?`))
    return;

  botao.disabled = true;
  try {
    await alterarStatus(reserva.id, "cancelada");
    await carregar();
  } catch (erro) {
    alert(erro.message);
    botao.disabled = false;
  }
}

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") fecharModalStatus();
});

if (autorizado) carregar();
