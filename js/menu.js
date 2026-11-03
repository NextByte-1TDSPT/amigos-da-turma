// Abre e fecha o menu de navegação em celulares.
const botaoMenu = document.querySelector(".botao-menu");
const menuPrincipal = document.querySelector("#menu-principal");

if (botaoMenu && menuPrincipal) {
  botaoMenu.addEventListener("click", function () {
    menuPrincipal.classList.toggle("aberto");

    const menuAberto = menuPrincipal.classList.contains("aberto");
    botaoMenu.setAttribute("aria-expanded", menuAberto);
    botaoMenu.textContent = menuAberto ? "✕ Fechar" : "☰ Menu";
  });
}