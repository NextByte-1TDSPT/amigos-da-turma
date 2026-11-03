// Consulta, alteração e cancelamento da contribuição recorrente demonstrativa.
document.addEventListener("DOMContentLoaded", function () {
  const status = document.getElementById("doador-rec-status");
  const detalhes = document.getElementById("doador-rec-detalhes");
  const formulario = document.getElementById("doador-rec-edicao");
  if (!status || !detalhes || !formulario) return;

  const frequencias = { mensal: "Mensal", trimestral: "Trimestral", anual: "Anual" };
  function moeda(valor) { return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function lerDoacao() {
    try {
      const sessao = JSON.parse(sessionStorage.getItem("amigosTurmaSessaoDemo"));
      const chave = "doacaoRecorrente_" + String(sessao && sessao.email || "").trim().toLowerCase();
      let dados = JSON.parse(localStorage.getItem(chave));
      if (!dados && sessao && sessao.email) {
        const legado = JSON.parse(localStorage.getItem("doacaoRecorrente"));
        if (legado && String(legado.email || "").trim().toLowerCase() === String(sessao.email).toLowerCase()) {
          dados = legado;
          localStorage.setItem(chave, JSON.stringify(legado));
        }
      }
      if (dados && Number(dados.valor) >= 10 && frequencias[dados.frequencia] && dados.nome && dados.email && ["ativa", "cancelada"].includes(dados.status)) return dados;
    } catch (erro) { /* Mantém o estado vazio quando não há dados válidos. */ }
    return null;
  };
  let doacao = lerDoacao();

  function atualizarTela() {
    const ativa = doacao && doacao.status === "ativa";
    detalhes.hidden = !ativa;
    formulario.hidden = true;
    if (!ativa) {
      status.textContent = doacao && doacao.status === "cancelada"
        ? "Sua contribuição recorrente está cancelada. Você pode iniciar uma nova doação pela página Doação."
        : "Nenhuma doação recorrente cadastrada neste navegador. Para começar, escolha a opção recorrente na página Doação.";
      return;
    }
    status.textContent = "Sua contribuição recorrente está ativa nesta demonstração.";
    document.getElementById("doador-rec-valor").textContent = moeda(doacao.valor);
    document.getElementById("doador-rec-frequencia").textContent = frequencias[doacao.frequencia];
    document.getElementById("doador-rec-nome").textContent = doacao.nome;
    document.getElementById("doador-rec-email").textContent = doacao.email;
    document.getElementById("doador-rec-situacao").textContent = "Ativa";
  }

  document.getElementById("doador-rec-abrir-edicao").addEventListener("click", function () {
    document.getElementById("doador-rec-novo-valor").value = doacao.valor;
    document.getElementById("doador-rec-nova-frequencia").value = doacao.frequencia;
    formulario.hidden = false;
    formulario.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("doador-rec-descartar").addEventListener("click", function () {
    formulario.reset();
    formulario.hidden = true;
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const valor = Number(document.getElementById("doador-rec-novo-valor").value);
    const frequencia = document.getElementById("doador-rec-nova-frequencia").value;
    if (!Number.isFinite(valor) || valor < 10 || !frequencias[frequencia]) {
      status.textContent = "Informe um valor a partir de R$ 10,00 e uma frequência válida.";
      return;
    }
    doacao.valor = valor;
    doacao.frequencia = frequencia;
    try {
      const sessao = JSON.parse(sessionStorage.getItem("amigosTurmaSessaoDemo"));
      const chave = "doacaoRecorrente_" + String(sessao && sessao.email || doacao.email || "").trim().toLowerCase();
      localStorage.setItem(chave, JSON.stringify(doacao));
      status.textContent = "Sua contribuição foi atualizada nesta simulação.";
    } catch (erro) {
      status.textContent = "Não foi possível salvar a alteração neste navegador.";
      return;
    }
    atualizarTela();
  });

  document.getElementById("doador-rec-cancelar").addEventListener("click", function () {
    if (!doacao || doacao.status !== "ativa") return;
    if (!window.confirm("Tem certeza de que deseja cancelar sua contribuição recorrente?")) return;
    doacao.status = "cancelada";
    try {
      const sessao = JSON.parse(sessionStorage.getItem("amigosTurmaSessaoDemo"));
      const chave = "doacaoRecorrente_" + String(sessao && sessao.email || doacao.email || "").trim().toLowerCase();
      localStorage.setItem(chave, JSON.stringify(doacao));
    }
    catch (erro) { status.textContent = "Não foi possível salvar o cancelamento neste navegador."; return; }
    atualizarTela();
    status.textContent = "Sua contribuição recorrente foi cancelada nesta simulação. Nenhuma cobrança será realizada.";
  });

  atualizarTela();
});
