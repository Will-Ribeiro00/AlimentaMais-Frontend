export function configurarTabs({ tabAtiva, tabInativa, aoAtivar }) {
  tabAtiva.addEventListener("click", () => {
    tabAtiva.classList.add("aba--ativa");
    tabInativa.classList.remove("aba--ativa");

    if (aoAtivar) {
      aoAtivar();
    }
  });
}
