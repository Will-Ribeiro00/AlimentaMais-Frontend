// Consumidor - Minhas reservas: GET /api/reservas e cancelamento (PATCH /api/reservas/{id}/cancelar).
import { chamarApi } from "../api.js";
import { STATUS_RESERVA, data, ehHoje, escapar, hora, selo } from "../formatar.js";
import { autorizado } from "../painel.js";

const lista = document.getElementById("listaReservas");
const botaoVerMais = document.getElementById("verMais");

const RESERVAS_POR_VEZ = 10;

let reservas = [];
let quantidadeVisivel = RESERVAS_POR_VEZ;

const campo = (rotulo, valor) =>
  `<div class="reserva__campo"><dt>${rotulo}</dt><dd>${valor}</dd></div>`;

function quando(reserva) {
  return ehHoje(reserva.dataReserva)
    ? `Hoje<br />${hora(reserva.dataReserva)}`
    : data(reserva.dataReserva);
}

function renderizar() {
  if (!reservas.length) {
    botaoVerMais.hidden = true;
    lista.innerHTML = `<p class="cartao vazio">Você ainda não tem reservas. <a href="../inicio/index.html">Ver ofertas</a></p>`;
    return;
  }

  lista.innerHTML = reservas
    .slice(0, quantidadeVisivel)
    .map((reserva) => {
      const podeCancelar = reserva.status === "ativa";
      return `
        <article class="cartao reserva">
          <dl class="reserva__dados">
            ${campo("Produto", escapar(reserva.produto))}
            ${campo("Estabelecimento", escapar(reserva.estabelecimento))}
            ${campo("Data", quando(reserva))}
            ${campo("Código", `#${reserva.codigo}`)}
            ${campo("Status", selo(STATUS_RESERVA, reserva.status))}
          </dl>
          <button type="button" class="botao botao--laranja botao--pequeno reserva__cancelar" data-id="${reserva.id}" ${podeCancelar ? "" : "disabled"}>
            ${reserva.status === "cancelada" ? "Reserva cancelada" : "Cancelar reserva"}
          </button>
        </article>`;
    })
    .join("");
  botaoVerMais.hidden = quantidadeVisivel >= reservas.length;
}

async function carregar() {
  try {
    reservas = await chamarApi("/api/reservas");
    renderizar();
  } catch (erro) {
    lista.innerHTML = `<p class="cartao vazio">${escapar(erro.message)}</p>`;
  }
}

botaoVerMais.addEventListener("click", () => {
  quantidadeVisivel += RESERVAS_POR_VEZ;
  renderizar();
});

lista.addEventListener("click", async (evento) => {
  const botao = evento.target.closest(".reserva__cancelar");
  if (!botao || botao.disabled || !confirm("Deseja cancelar esta reserva?")) return;

  botao.disabled = true;
  try {
    await chamarApi(`/api/reservas/${botao.dataset.id}/cancelar`, { metodo: "PATCH" });
    await carregar();
  } catch (erro) {
    alert(erro.message);
    botao.disabled = false;
  }
});

if (autorizado) {
  lista.innerHTML = `<p class="cartao vazio">Carregando reservas...</p>`;
  carregar();
}
