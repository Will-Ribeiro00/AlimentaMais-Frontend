// Perfil (consumidor e estabelecimento): preenche os dados da conta com GET /api/perfil.
import { CATEGORIAS_ESTABELECIMENTO } from "./formatar.js";
import { perfil } from "./painel.js";

// "estabelecimento.cnpj" -> usuario.estabelecimento.cnpj
function lerCampo(usuario, caminho) {
  return caminho.split(".").reduce((objeto, chave) => objeto?.[chave], usuario);
}

perfil
  .then((usuario) => {
    document.querySelectorAll("[data-perfil]").forEach((elemento) => {
      const campo = elemento.dataset.perfil;
      let valor = lerCampo(usuario, campo);

      if (campo === "estabelecimento.categoria") valor = CATEGORIAS_ESTABELECIMENTO[valor] ?? valor;

      elemento.textContent = valor || "Não informado";
    });
  })
  .catch((erro) => {
    document.querySelectorAll("[data-perfil]").forEach((elemento) => (elemento.textContent = "—"));
    alert(erro.message);
  });
