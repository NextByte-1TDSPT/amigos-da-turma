// Alterna entre as opções de contribuição.
document.addEventListener("DOMContentLoaded", function () {
  const escolha = document.getElementById("escolha-modalidade");
  const painelPontual = document.getElementById("painel-pontual");
  const painelRecorrente = document.getElementById("painel-recorrente");
  const painelNfp = document.getElementById("painel-nfp");
  const formularios = document.getElementById("formularios-doacao");

  if (
    !escolha ||
    !painelPontual ||
    !painelRecorrente ||
    !painelNfp ||
    !formularios
  ) {
    return;
  }

  function mostrarModalidade(modalidade) {
    escolha.hidden = true;
    painelPontual.hidden = modalidade !== "pontual";
    painelRecorrente.hidden = modalidade !== "recorrente";
    painelNfp.hidden = modalidade !== "nfp";
    formularios.classList.add("modalidade-escolhida");

    let painel = painelPontual;
    if (modalidade === "recorrente") {
      painel = painelRecorrente;
    } else if (modalidade === "nfp") {
      painel = painelNfp;
    }

    painel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function voltarParaEscolha() {
    painelPontual.hidden = true;
    painelRecorrente.hidden = true;
    painelNfp.hidden = true;
    escolha.hidden = false;
    formularios.classList.remove("modalidade-escolhida");
    escolha.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll("[data-modalidade]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      mostrarModalidade(botao.dataset.modalidade);
    });
  });

  document
    .querySelectorAll("[data-voltar-modalidades]")
    .forEach(function (botao) {
      botao.addEventListener("click", voltarParaEscolha);
    });
});