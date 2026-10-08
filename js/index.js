// Página inicial: números do bloco "Impacto gerado" vindos de GET /api/impacto.
// Se a API não responder, ficam os valores que já estão no HTML.
import { chamarApi } from "./api.js";
import { numero } from "./formatar.js";

try {
  const impacto = await chamarApi("/api/impacto", { autenticado: false });

  const valores = {
    alimentosSalvos: numero(impacto.alimentosSalvos),
    kgReaproveitados: numero(impacto.kgReaproveitados),
    receitaEstabelecimentos: `R$${numero(impacto.receitaEstabelecimentos)}`,
  };

  document.querySelectorAll("[data-impacto]").forEach((elemento) => {
    elemento.textContent = valores[elemento.dataset.impacto];
  });
} catch {
  // mantém os números de exemplo
}
