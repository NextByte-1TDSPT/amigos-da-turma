
/* SPRINT 2 - DAVID | DOAÇÃO RECORRENTE */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const form = $("form-recorrente");
  if (!form) return;

  const valorExtra = $("rec-outro-valor");
  const radios = [...form.querySelectorAll('[name="rec-valor"]')];
  const frequencia = $("rec-frequencia");
  const nome = $("rec-nome");
  const email = $("rec-email");
  const erro = $("rec-erro");
  const etapas = [...document.querySelectorAll("#rec-etapas li")];
  const resumo = $("rec-resumo");
  const confirmacao = $("rec-confirmacao");
  const status = $("rec-status");
  const botaoConfirmar = $("btn-confirmar-recorrencia");

  const frequencias = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual"
  };

  const moeda = (valor) => Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const nomeValido = () => nome.value.trim().split(/\s+/).length >= 2;
  const emailValido = () =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

  let doacao = null;
  let editando = false;
  let concluida = false;

  // Valor selecionado ou personalizado
  function obterValor() {
    const texto = valorExtra.value.trim();

    if (texto) {
      if (!/^\d+([.,]\d{1,2})?$/.test(texto)) return null;
      return Number(texto.replace(",", "."));
    }

    const marcado = radios.find((radio) => radio.checked);
    return marcado ? Number(marcado.value) : null;
  }

  // Salvar e recuperar a simulação
  function salvar() {
    try {
      localStorage.setItem("doacaoRecorrente", JSON.stringify(doacao));
      return true;
    } catch {
      return false;
    }
  }

  function carregar() {
    try {
      const dados = JSON.parse(localStorage.getItem("doacaoRecorrente"));

      if (
        dados &&
        Number.isFinite(dados.valor) &&
        dados.valor >= 10 &&
        frequencias[dados.frequencia] &&
        typeof dados.nome === "string" &&
        typeof dados.email === "string" &&
        ["ativa", "cancelada"].includes(dados.status)
      ) {
        doacao = dados;
      }
    } catch {
      doacao = null;
    }
  }

  // Limpar mensagens e bordas de erro
  function limparErros() {
    erro.textContent = "";

    [valorExtra, frequencia, nome, email].forEach((campo) => {
      campo.classList.remove("erro");
      campo.removeAttribute("aria-invalid");
    });
  }

  // Resumo em tempo real e barra de etapas
  function atualizarInteratividade() {
    const valor = obterValor();

    $("rec-previa-valor").textContent =
      valor !== null && valor >= 10
        ? `Você vai doar ${moeda(valor)}.`
        : "Escolha um valor para começar.";

    $("rec-previa-frequencia").textContent =
      frequencias[frequencia.value]
        ? `Frequência: ${frequencias[frequencia.value]}.`
        : "Selecione a frequência da doação.";

    const concluidas = [
      valor !== null && valor >= 10,
      Boolean(frequencias[frequencia.value]),
      nomeValido() && emailValido(),
      concluida
    ];

    let atual = false;

    etapas.forEach((etapa, i) => {
      etapa.classList.remove("ativa", "concluida");

      if (concluidas[i]) {
        etapa.classList.add("concluida");
      } else if (!atual) {
        etapa.classList.add("ativa");
        atual = true;
      }
    });
  }

  // Atualizar o gerenciamento
  function atualizarTela() {
    const ativa = doacao?.status === "ativa";

    resumo.hidden = !ativa;
    form.hidden = ativa && !editando;
    $("rec-editar").hidden = !ativa;
    $("rec-cancelar").hidden = !ativa;

    if (ativa) {
      $("rec-resumo-valor").textContent = moeda(doacao.valor);
      $("rec-resumo-frequencia").textContent =
        frequencias[doacao.frequencia];
      $("rec-resumo-nome").textContent = doacao.nome;
      $("rec-resumo-status").textContent = "Ativa";
    }

    status.textContent = ativa
      ? "Sua contribuição está ativa nesta simulação."
      : doacao?.status === "cancelada"
        ? "Sua recorrência foi cancelada nesta simulação."
        : "Nenhuma doação recorrente cadastrada.";

    atualizarInteratividade();
  }

  // Validação de todos os campos
  function validar() {
    limparErros();
    const erros = [];
    const valor = obterValor();

    function adicionar(campo, mensagem) {
      campo.classList.add("erro");
      campo.setAttribute("aria-invalid", "true");
      erros.push({ campo, mensagem });
    }

    if (valor === null || valor < 10) {
      adicionar(valorExtra, "Escolha um valor válido de no mínimo R$ 10,00.");
    }
    if (!frequencias[frequencia.value]) {
      adicionar(frequencia, "Selecione a frequência da doação.");
    }
    if (!nomeValido()) {
      adicionar(nome, "Digite seu nome e sobrenome.");
    }
    if (!emailValido()) {
      adicionar(email, "Digite um e-mail válido.");
    }

    erro.textContent = erros.map((item) => item.mensagem).join(" ");
    if (erros.length) erros[0].campo.focus();

    return erros.length === 0;
  }

  // Eventos dos campos
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      valorExtra.value = "";
      limparErros();
      atualizarInteratividade();
    });
  });

  valorExtra.addEventListener("input", () => {
    radios.forEach((radio) => radio.checked = false);
    limparErros();
    atualizarInteratividade();
  });

  valorExtra.addEventListener("blur", () => {
    if (valorExtra.value.trim() && (obterValor() ?? 0) < 10) {
      valorExtra.classList.add("erro");
      erro.textContent = "Digite um valor válido de no mínimo R$ 10,00.";
    }
  });

  [frequencia, nome, email].forEach((campo) => {
    campo.addEventListener("input", () => {
      limparErros();
      atualizarInteratividade();
    });
    campo.addEventListener("change", atualizarInteratividade);
  });

  // Confirmação personalizada
  function mostrarConfirmacao(eraEdicao) {
    const primeiroNome = doacao.nome.split(/\s+/)[0];

    $("rec-conf-texto").textContent = eraEdicao
      ? `Pronto, ${primeiroNome}! Sua contribuição foi atualizada.`
      : `Obrigado, ${primeiroNome}! Veja sua contribuição recorrente.`;

    $("rec-conf-valor").textContent = moeda(doacao.valor);
    $("rec-conf-frequencia").textContent = frequencias[doacao.frequencia];
    $("rec-conf-status").textContent = "Ativa";
    $("rec-conf-email").textContent =
      `Um e-mail de confirmação seria enviado para ${doacao.email}.`;

    confirmacao.hidden = false;
    confirmacao.scrollIntoView({ behavior: "smooth", block: "center" });
    confirmacao.focus();
  }

  // Cadastrar ou atualizar
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validar()) return;

    const eraEdicao = editando;

    doacao = {
      valor: obterValor(),
      frequencia: frequencia.value,
      nome: nome.value.trim(),
      email: email.value.trim(),
      status: "ativa"
    };

    editando = false;
    concluida = true;

    const salvou = salvar();
    form.reset();
    botaoConfirmar.textContent = "Confirmar doação recorrente";

    atualizarTela();
    mostrarConfirmacao(eraEdicao);

    status.textContent = salvou
      ? "Doação registrada com sucesso nesta simulação."
      : "Doação simulada, mas não foi possível salvá-la no navegador.";
  });

  // Editar doação
  $("rec-editar").addEventListener("click", () => {
    if (doacao?.status !== "ativa") return;

    confirmacao.hidden = true;
    editando = true;
    concluida = false;

    nome.value = doacao.nome;
    email.value = doacao.email;
    frequencia.value = doacao.frequencia;

    radios.forEach((radio) => {
      radio.checked = Number(radio.value) === doacao.valor;
    });

    valorExtra.value = radios.some((radio) => radio.checked)
      ? ""
      : String(doacao.valor).replace(".", ",");

    botaoConfirmar.textContent = "Salvar alterações";
    limparErros();
    atualizarTela();
    form.scrollIntoView({ behavior: "smooth" });
  });

  // Cancelar recorrência
  $("rec-cancelar").addEventListener("click", () => {
    if (doacao?.status !== "ativa") return;

    if (!confirm("Deseja cancelar sua doação recorrente?")) return;

    doacao.status = "cancelada";
    editando = false;
    concluida = false;

    salvar();
    form.reset();
    confirmacao.hidden = true;
    botaoConfirmar.textContent = "Confirmar doação recorrente";

    atualizarTela();
    status.textContent = "Recorrência cancelada com sucesso nesta simulação.";
  });

  // Fazer nova simulação
  $("rec-nova-doacao").addEventListener("click", () => {
    confirmacao.hidden = true;
    concluida = false;
    editando = doacao?.status === "ativa";

    form.reset();
    limparErros();
    botaoConfirmar.textContent = "Confirmar doação recorrente";

    atualizarTela();
    status.textContent = "Preencha os dados para uma nova simulação.";
    form.scrollIntoView({ behavior: "smooth" });
  });

  // Inicialização
  carregar();
  confirmacao.hidden = true;
  atualizarTela();
});
