// Comunicação com a API do Alimenta+ e controle do token de login.

const API_PRODUCAO = "https://alimenta-mais-fyfwggdtchamafe7.centralus-01.azurewebsites.net";

// Para testar com a API rodando na sua máquina, rode no console do navegador:
//   localStorage.setItem("alimentaApiUrl", "http://localhost:5211")
// e para voltar à API do Azure: localStorage.removeItem("alimentaApiUrl")
export const API_URL = lerArmazenamento(localStorage, "alimentaApiUrl") || API_PRODUCAO;

const CHAVE_TOKEN = "accessToken";
const PAGINA_LOGIN = new URL("../pags/login/index.html", import.meta.url).href;

function lerArmazenamento(armazenamento, chave) {
  try {
    return armazenamento.getItem(chave);
  } catch {
    return null;
  }
}

// ---------- Sessão ----------

// "Lembrar de mim" guarda o token no localStorage; sem ele, só até fechar o navegador
export function salvarToken(token, lembrar = false) {
  sessionStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_TOKEN);
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_TOKEN, token);
}

export function obterToken() {
  return (
    lerArmazenamento(sessionStorage, CHAVE_TOKEN) || lerArmazenamento(localStorage, CHAVE_TOKEN)
  );
}

export function sair() {
  sessionStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_TOKEN);
}

// Lê o conteúdo do token (id, tipo_usuario e validade) sem precisar chamar a API
export function dadosDoToken() {
  const token = obterToken();
  if (!token) return null;

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const dados = JSON.parse(atob(base64));
    if (dados.exp * 1000 <= Date.now()) return null;
    return { id: Number(dados.id), tipoUsuario: dados.tipo_usuario };
  } catch {
    return null;
  }
}

export function irParaLogin() {
  sair();
  window.location.replace(PAGINA_LOGIN);
}

// ---------- Requisições ----------

async function lerJson(resposta) {
  try {
    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

// Faz a chamada e devolve o JSON. Em caso de erro, lança Error com a mensagem da API.
export async function chamarApi(caminho, { metodo = "GET", corpo, autenticado = true } = {}) {
  const cabecalhos = {};
  if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
  if (autenticado) cabecalhos.Authorization = `Bearer ${obterToken()}`;

  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    );
  }

  // Token ausente ou expirado: volta para o login
  if (resposta.status === 401 && autenticado) {
    irParaLogin();
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const dados = await lerJson(resposta);

  if (!resposta.ok) {
    throw new Error(dados?.mensagem || "Não foi possível concluir a ação. Tente novamente.");
  }

  return dados;
}
