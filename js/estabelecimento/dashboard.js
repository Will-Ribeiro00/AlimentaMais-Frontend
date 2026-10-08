// Estabelecimento - Dashboard: GET /api/estabelecimento/dashboard.
import { chamarApi } from "../api.js";
import { STATUS_RESERVA, escapar, mesCurto, moeda, numero, selo } from "../formatar.js";
import { autorizado } from "../painel.js";

const SVG = "http://www.w3.org/2000/svg";
const ICONES = "../../../imagens/icones";
const grafico = document.getElementById("graficoMetricas");
let metricas = [];

function renderizarIndicadores(d) {
  const indicadores = [
    { valor: d.reservasHoje, rotulo: "Reservas feitas hoje", icone: "dashboard_duas_pessoas.svg" },
    { valor: d.retiradasHoje, rotulo: "Reservas retiradas hoje", icone: "dashboard_sacola.svg" },
    { valor: d.aguardandoRetirada, rotulo: "Aguardando retirada", icone: "dashboard_relogio.svg" },
    { valor: d.alimentosSalvosHoje, rotulo: "Alimentos salvos hoje", icone: "dashboard_folha.svg" },
  ];

  document.getElementById("indicadores").innerHTML = indicadores
    .map(
      ({ valor, rotulo, icone }) => `
        <article class="cartao indicador">
          <strong class="indicador__valor">${valor}</strong>
          <span class="indicador__rotulo">${rotulo}</span>
          <img class="indicador__icone" src="${ICONES}/${icone}" alt="" />
        </article>`,
    )
    .join("");
}

function renderizarImpacto(d) {
  document.getElementById("impactoItens").innerHTML = `
    <div class="impacto__item">
      <img src="${ICONES}/dashboard_bebida_fruta.svg" alt="" />
      <strong>${d.itensSalvosMes}</strong>
      <span>Itens<br />salvos</span>
    </div>
    <div class="impacto__item">
      <img src="${ICONES}/dashboard_mundo.svg" alt="" />
      <strong>${numero(d.kgEvitadosMes, 1)}<small>kg</small></strong>
      <span>Descarte<br />evitado</span>
    </div>
    <div class="impacto__item">
      <img src="${ICONES}/dashboard_tres_pessoas.svg" alt="" />
      <strong>${d.pessoasAtendidasMes}</strong>
      <span>Pessoas<br />atendidas</span>
    </div>`;
}

function renderizarReceita(d) {
  document.getElementById("receitaValor").textContent = moeda(d.receitaMes);
  const variacao = d.variacaoReceita;
  document.getElementById("receitaComparacao").textContent =
    variacao === null
      ? "Sem receita no mês passado para comparar."
      : `${variacao >= 0 ? "+" : ""}${numero(variacao, 1)}% em relação ao mês passado.`;
}

function renderizarUltimasReservas(d) {
  const lista = document.getElementById("ultimasReservas");

  if (!d.ultimasReservas.length) {
    lista.innerHTML = `<p class="vazio">Nenhuma reserva ainda.</p>`;
    return;
  }

  lista.innerHTML = d.ultimasReservas
    .map(
      (r) => `
        <div class="linha-reserva">
          <strong>${escapar(r.nomeCliente)}</strong>
          <span>${escapar(r.produto)}</span>
          <span>#${r.codigo}</span>
          ${selo(STATUS_RESERVA, r.status)}
        </div>`,
    )
    .join("");
}

// ---------- Gráfico dos últimos 6 meses ----------

function elementoSVG(tag, atributos) {
  const elemento = document.createElementNS(SVG, tag);
  Object.entries(atributos).forEach(([nome, valor]) => elemento.setAttribute(nome, valor));
  grafico.appendChild(elemento);
  return elemento;
}

function desenharGrafico() {
  if (!metricas.length) return;

  const { width, height } = grafico.getBoundingClientRect();
  const largura = Math.max(width || 600, 320);
  const altura = Math.max(height || 220, 170);
  const compacto = largura < 450;
  const margem = {
    esquerda: compacto ? 34 : 48,
    direita: compacto ? 12 : 22,
    topo: 18,
    base: compacto ? 30 : 38,
  };
  const areaX = largura - margem.esquerda - margem.direita;
  const areaY = altura - margem.topo - margem.base;
  const maximo = Math.max(
    4,
    ...metricas.map((m) => m.reservas),
    ...metricas.map((m) => m.retiradas),
  );
  const fonte = compacto ? "8" : "9";

  const x = (i) => margem.esquerda + (i * areaX) / Math.max(metricas.length - 1, 1);
  const y = (valor) => margem.topo + areaY - (valor / maximo) * areaY;

  grafico.setAttribute("viewBox", `0 0 ${largura} ${altura}`);
  grafico.innerHTML = "";

  for (let passo = 0; passo <= 4; passo++) {
    const valor = Math.round((maximo / 4) * passo);
    elementoSVG("line", {
      x1: margem.esquerda,
      x2: largura - margem.direita,
      y1: y(valor),
      y2: y(valor),
      stroke: "#dedbd2",
    });
    elementoSVG("text", {
      x: margem.esquerda - 7,
      y: y(valor) + 3,
      "text-anchor": "end",
      fill: "#89877f",
      "font-size": fonte,
    }).textContent = valor;
  }

  metricas.forEach((m, i) => {
    elementoSVG("text", {
      x: x(i),
      y: altura - 8,
      "text-anchor": "middle",
      fill: "#77766f",
      "font-size": fonte,
    }).textContent = mesCurto(m.mes);
  });

  function serie(valores, cor) {
    const caminho = valores.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");
    const linha = elementoSVG("path", {
      d: caminho,
      class: `grafico__linha grafico__linha--${cor}`,
    });
    linha.style.setProperty("--comprimento", Math.max(linha.getTotalLength(), 100));

    valores.forEach((v, i) => {
      const ponto = elementoSVG("circle", {
        cx: x(i),
        cy: y(v),
        r: compacto ? 3 : 3.5,
        class: "grafico__ponto",
        fill: cor === "laranja" ? "#f2522f" : "#18341e",
      });
      ponto.style.animationDelay = `${1.2 + i * 0.08}s`;
    });
  }

  serie(
    metricas.map((m) => m.reservas),
    "laranja",
  );
  serie(
    metricas.map((m) => m.retiradas),
    "verde",
  );
  document.getElementById("periodoGrafico").textContent = `Últimos ${metricas.length} meses`;
}

async function carregar() {
  try {
    const dashboard = await chamarApi("/api/estabelecimento/dashboard");
    renderizarIndicadores(dashboard);
    renderizarImpacto(dashboard);
    renderizarReceita(dashboard);
    renderizarUltimasReservas(dashboard);
    metricas = dashboard.metricasMensais;
    desenharGrafico();
  } catch (erro) {
    document.getElementById("indicadores").innerHTML =
      `<p class="cartao vazio">${escapar(erro.message)}</p>`;
  }
}

if (autorizado) {
  carregar();
  new ResizeObserver(desenharGrafico).observe(grafico.parentElement);
}
