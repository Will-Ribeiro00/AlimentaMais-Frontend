// Estabelecimento - Minhas ofertas: publicar (POST), alterar estoque, ativar/inativar e excluir
// usando /api/estabelecimento/ofertas.
import { chamarApi } from "../api.js";
import { STATUS_OFERTA, data, escapar, moeda, selo } from "../formatar.js";
import { autorizado, mostrarMensagem } from "../painel.js";

const $ = (id) => document.getElementById(id);

const formulario = $("formOferta");
const botaoPublicar = formulario.querySelector('button[type="submit"]');
const mensagemOferta = $("mensagemOferta");
const horario = $("horarioRetirada");
const erroHorario = $("erroHorario");
const tabela = $("tabelaOfertas");
const paginacao = $("paginacao");
const modalEstoque = $("modalEstoque");
const novoEstoque = $("novoEstoque");
const botaoSalvarEstoque = $("salvarEstoque");
const mensagemEstoque = $("mensagemEstoque");

const POR_PAGINA = 10;

let ofertas = [];
let pagina = 1;
let ofertaSelecionada = null;

const buscarOferta = (id) => ofertas.find((oferta) => oferta.id === Number(id));

// ---------- Tabela ----------

function linha(oferta) {
  const nome = escapar(oferta.nomeProduto);
  const inativa = oferta.status === "concluido";

  return `
    <tr>
      <td data-rotulo="Oferta">${nome}</td>
      <td data-rotulo="Qtd.">${oferta.quantidade} un.</td>
      <td data-rotulo="Data">${data(oferta.dataPublicacao)}</td>
      <td data-rotulo="Preço">${moeda(oferta.precoAlimentaMais)}</td>
      <td data-rotulo="Status">${selo(STATUS_OFERTA, oferta.status)}</td>
      <td class="tabela-ofertas__acoes">
        <div class="acoes">
          <button type="button" class="acoes__botao" data-menu aria-expanded="false" aria-label="Opções da oferta ${nome}">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <div class="acoes__menu">
            <button type="button" data-acao="estoque" data-id="${oferta.id}">
              <i class="fa-solid fa-box"></i>Alterar estoque
            </button>
            <button type="button" data-acao="ativar" data-id="${oferta.id}">
              <i class="fa-solid fa-power-off"></i>${inativa ? "Ativar oferta" : "Inativar oferta"}
            </button>
            <button type="button" class="acoes__excluir" data-acao="excluir" data-id="${oferta.id}">
              <i class="fa-solid fa-trash"></i>Excluir oferta
            </button>
          </div>
        </div>
      </td>
    </tr>`;
}

// Páginas mostradas: primeira, última e as vizinhas da atual (1 … 4 5 6 … 15)
function paginasVisiveis(totalPaginas) {
  const paginas = [];
  for (let numero = 1; numero <= totalPaginas; numero++) {
    const perto = Math.abs(numero - pagina) <= 1;
    if (numero === 1 || numero === totalPaginas || perto) paginas.push(numero);
    else if (paginas.at(-1) !== "…") paginas.push("…");
  }
  return paginas;
}

function botaoPagina(numero, texto, rotulo) {
  const atual = numero === pagina && !rotulo;
  return `
    <button type="button" class="paginacao__botao ${atual ? "paginacao__botao--ativo" : ""}" data-pagina="${numero}"
      ${atual ? 'aria-current="page"' : ""} ${rotulo ? `aria-label="${rotulo}"` : ""}>${texto}</button>`;
}

function renderizarPaginacao(totalPaginas) {
  if (totalPaginas <= 1) {
    paginacao.innerHTML = "";
    return;
  }

  const anterior = pagina > 1 ? botaoPagina(pagina - 1, "‹", "Página anterior") : "";
  const proxima = pagina < totalPaginas ? botaoPagina(pagina + 1, "›", "Próxima página") : "";
  const numeros = paginasVisiveis(totalPaginas)
    .map((numero) =>
      numero === "…"
        ? `<span class="paginacao__reticencias">…</span>`
        : botaoPagina(numero, numero),
    )
    .join("");

  paginacao.innerHTML = anterior + numeros + proxima;
}

function renderizar() {
  $("totalOfertas").textContent =
    `${ofertas.length} ${ofertas.length === 1 ? "oferta" : "ofertas"}`;

  if (!ofertas.length) {
    tabela.innerHTML = `<tr><td colspan="6" class="vazio">Nenhuma oferta cadastrada.</td></tr>`;
    renderizarPaginacao(0);
    return;
  }

  const totalPaginas = Math.ceil(ofertas.length / POR_PAGINA);
  pagina = Math.min(pagina, totalPaginas);

  tabela.innerHTML = ofertas
    .slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
    .map(linha)
    .join("");
  renderizarPaginacao(totalPaginas);
}

async function carregar() {
  try {
    ofertas = await chamarApi("/api/estabelecimento/ofertas");
    renderizar();
  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="6" class="vazio">${escapar(erro.message)}</td></tr>`;
  }
}

paginacao.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-pagina]");
  if (!botao) return;

  pagina = Number(botao.dataset.pagina);
  renderizar();
});

// ---------- Menu de ações ----------

function fecharMenus() {
  document.querySelectorAll(".acoes__menu--aberto").forEach((menu) => {
    menu.classList.remove("acoes__menu--aberto");
    menu.previousElementSibling.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (evento) => {
  const botaoMenu = evento.target.closest("[data-menu]");
  const botaoAcao = evento.target.closest("[data-acao]");
  const menuJaAberto = botaoMenu?.nextElementSibling.classList.contains("acoes__menu--aberto");

  fecharMenus();

  if (botaoMenu && !menuJaAberto) {
    botaoMenu.nextElementSibling.classList.add("acoes__menu--aberto");
    botaoMenu.setAttribute("aria-expanded", "true");
    return;
  }

  if (!botaoAcao) return;

  const oferta = buscarOferta(botaoAcao.dataset.id);
  if (!oferta) return;

  const { acao } = botaoAcao.dataset;
  if (acao === "estoque") abrirModalEstoque(oferta);
  if (acao === "ativar") alternarAtiva(oferta);
  if (acao === "excluir") excluirOferta(oferta);
});

// ---------- Publicar oferta ----------

// "0830" -> "08:30"
function normalizarHorario(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  return digitos.length > 2 ? `${digitos.slice(0, 2)}:${digitos.slice(2)}` : digitos;
}

const horarioValido = (valor) => /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);

horario.addEventListener("input", () => {
  horario.value = normalizarHorario(horario.value);
  erroHorario.textContent =
    horario.value.length === 5 && !horarioValido(horario.value)
      ? "Horário inválido. Use entre 00:00 e 23:59."
      : "";
});

function validar(oferta) {
  if (oferta.nomeProduto.length < 2) return "Digite um nome válido para a oferta.";
  if (!(oferta.precoOriginal > 0)) return "Informe um preço original válido.";
  if (!(oferta.precoAlimentaMais >= 0) || oferta.precoAlimentaMais > oferta.precoOriginal)
    return "O preço Alimenta+ precisa ser menor ou igual ao preço original.";
  if (!Number.isInteger(oferta.quantidade) || oferta.quantidade < 0)
    return "Digite uma quantidade válida.";
  if (!horarioValido(oferta.horarioRetirada))
    return "Horário inválido. Use HH:MM entre 00:00 e 23:59.";
  if (!(oferta.pesoProduto >= 0)) return "Informe um peso válido.";
  return "";
}

// Campo vazio vira NaN para não passar na validação
const numeroDoCampo = (id) => ($(id).value.trim() === "" ? NaN : Number($(id).value));

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const oferta = {
    nomeProduto: $("nomeOferta").value.trim(),
    descricao: $("descricaoOferta").value.trim(),
    categoria: $("categoriaOferta").value,
    precoOriginal: numeroDoCampo("precoOriginal"),
    precoAlimentaMais: numeroDoCampo("precoOferta"),
    quantidade: numeroDoCampo("estoqueOferta"),
    pesoProduto: numeroDoCampo("pesoOferta"),
    horarioRetirada: normalizarHorario(horario.value),
  };

  const erro = validar(oferta);
  if (erro) {
    mostrarMensagem(mensagemOferta, erro);
    return;
  }

  mostrarMensagem(mensagemOferta, "");
  erroHorario.textContent = "";
  botaoPublicar.disabled = true;

  try {
    await chamarApi("/api/estabelecimento/ofertas", { metodo: "POST", corpo: oferta });
    formulario.reset();
    $("pesoOferta").value = "0.30";
    mostrarMensagem(
      mensagemOferta,
      `Oferta "${oferta.nomeProduto}" publicada com sucesso.`,
      "sucesso",
    );
    pagina = 1;
    await carregar();
  } catch (erroApi) {
    mostrarMensagem(mensagemOferta, erroApi.message);
  } finally {
    botaoPublicar.disabled = false;
  }
});

// ---------- Estoque ----------

function abrirModalEstoque(oferta) {
  ofertaSelecionada = oferta;
  $("nomeOfertaSelecionada").textContent = oferta.nomeProduto;
  novoEstoque.value = oferta.quantidade;
  mostrarMensagem(mensagemEstoque, "");
  botaoSalvarEstoque.disabled = false;
  modalEstoque.classList.add("modal--aberto");
  novoEstoque.focus();
}

function fecharModalEstoque() {
  modalEstoque.classList.remove("modal--aberto");
  ofertaSelecionada = null;
}

modalEstoque.addEventListener("click", (evento) => {
  if (evento.target === modalEstoque || evento.target.closest("[data-fechar]"))
    fecharModalEstoque();
});

botaoSalvarEstoque.addEventListener("click", async () => {
  const quantidade = novoEstoque.value.trim() === "" ? NaN : Number(novoEstoque.value);
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    mostrarMensagem(mensagemEstoque, "Informe uma quantidade inteira válida.");
    return;
  }

  botaoSalvarEstoque.disabled = true;
  try {
    await chamarApi(`/api/estabelecimento/ofertas/${ofertaSelecionada.id}/estoque`, {
      metodo: "PATCH",
      corpo: { quantidade },
    });
    fecharModalEstoque();
    await carregar();
  } catch (erro) {
    mostrarMensagem(mensagemEstoque, erro.message);
    botaoSalvarEstoque.disabled = false;
  }
});

// ---------- Ativar / inativar e excluir ----------

async function alternarAtiva(oferta) {
  try {
    await chamarApi(`/api/estabelecimento/ofertas/${oferta.id}/status`, {
      metodo: "PATCH",
      corpo: { ativa: oferta.status === "concluido" },
    });
    await carregar();
  } catch (erro) {
    alert(erro.message);
  }
}

async function excluirOferta(oferta) {
  if (!confirm(`Excluir a oferta "${oferta.nomeProduto}"?`)) return;

  try {
    await chamarApi(`/api/estabelecimento/ofertas/${oferta.id}`, { metodo: "DELETE" });
    await carregar();
  } catch (erro) {
    alert(erro.message);
  }
}

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    fecharModalEstoque();
    fecharMenus();
  }
});

if (autorizado) {
  tabela.innerHTML = `<tr><td colspan="6" class="vazio">Carregando ofertas...</td></tr>`;
  carregar();
}
