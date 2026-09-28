export function configurarTabs({
  tabAtiva,
  tabInativa,
  aoAtivar
}) {
  tabAtiva.addEventListener('click', () => {
    tabAtiva.classList.add('active');
    tabInativa.classList.remove('active');

    if (aoAtivar) {
      aoAtivar();
    }
  });
}