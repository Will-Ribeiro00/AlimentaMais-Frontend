// Formatação dos dados que vêm da API para exibir na tela.

const FUSO = "America/Sao_Paulo";

export function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function numero(valor, casas = 0) {
  return Number(valor || 0).toLocaleString("pt-BR", { maximumFractionDigits: casas });
}

export function data(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: FUSO });
}

export function hora(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ehHoje(iso) {
  return data(iso) === new Date().toLocaleDateString("pt-BR", { timeZone: FUSO });
}

// "2026-10" -> "out"
export function mesCurto(anoMes) {
  const [ano, mes] = anoMes.split("-").map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

export function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML.replaceAll('"', "&quot;");
}

// Valores gravados no banco -> texto e classe de cor usados nas telas
export const STATUS_OFERTA = {
  disponivel: { texto: "Disponível", classe: "status--disponivel" },
  reservado: { texto: "Esgotada", classe: "status--esgotada" },
  expirado: { texto: "Expirada", classe: "status--expirado" },
  concluido: { texto: "Inativa", classe: "status--inativa" },
};

export const STATUS_RESERVA = {
  ativa: { texto: "Aguardando retirada", classe: "status--aguardando" },
  retirada: { texto: "Retirada", classe: "status--retirada" },
  cancelada: { texto: "Cancelada", classe: "status--cancelada" },
};

export function selo(mapa, status) {
  const { texto, classe } = mapa[status] ?? { texto: status, classe: "" };
  return `<span class="status ${classe}">${escapar(texto)}</span>`;
}

// icone: início do nome do arquivo em imagens/icones/ (+ "_verde.svg" ou "_laranja.svg")
export const CATEGORIAS_OFERTA = {
  padaria: { texto: "Padaria", icone: "categoria_padaria" },
  hortifruti: { texto: "Hortifruti", icone: "categoria_hortifruti" },
  refeicoes: { texto: "Refeições", icone: "categoria_refeicao" },
  bebidas: { texto: "Bebidas", icone: "categoria_bebida" },
  outros: { texto: "Outros", icone: "categoria_todos" }, // sem ícone próprio no protótipo
};

export const CATEGORIAS_ESTABELECIMENTO = {
  restaurante: "Restaurante",
  mercado: "Mercado",
  padaria: "Padaria",
  outro: "Outro",
};
