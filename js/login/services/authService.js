import { API_URL } from "../../api.js";

async function enviar(caminho, corpo) {
  try {
    return await fetch(`${API_URL}${caminho}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    );
  }
}

export async function login(email, password) {
  const response = await enviar("/hlm/login", { email, password });

  if (!response.ok) {
    throw new Error("E-mail ou senha inválidos.");
  }

  return await response.json();
}

export async function registrarUsuario(dados) {
  const response = await enviar("/api/usuario", dados);
  const resultado = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(resultado?.mensagem || "Não foi possível realizar o cadastro.");
  }

  return resultado;
}
