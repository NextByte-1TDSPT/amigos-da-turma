document.addEventListener("DOMContentLoaded", function () {
  function buscarElemento(id) {
    return document.getElementById(id);
  }
  const $ = buscarElemento;
  const form = $("form-recorrente");
  if (!form) return;

  const valorExtra = $("rec-outro-valor");
  const radios = form.querySelectorAll('[name="rec-valor"]');
  const frequencia = $("rec-frequencia");
  const nome = $("rec-nome");
  const email = $("rec-email");
  const erro = $("rec-erro");
  const etapas = document.querySelectorAll("#rec-etapas li");
  const resumo = $("rec-resumo");
  const confirmacao = $("rec-confirmacao");
  const status = $("rec-status");
  const botaoConfirmar = $("btn-confirmar-recorrencia");

  const frequencias = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual",
  };

  function moeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function nomeValido() {
    return nome.value.trim().split(/\s+/).length >= 2;
  }
  function emailValido() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  }

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

    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) return Number(radios[i].value);
    }
    return null;
  }

  // Cada recorrência fica associada ao e-mail informado no formulário.
  function chaveDoacao(email) {
    return (
      "doacaoRecorrente_" +
      String(email || "")
        .trim()
        .toLowerCase()
    );
  }

  // Salvar e recuperar a simulação
  function salvar() {
    try {
      localStorage.setItem(chaveDoacao(doacao.email), JSON.stringify(doacao));
      return true;
    } catch {
      return false;
    }
  }

  function carregar() {
    try {
      let emailSessao = "";
      try {
        const sessao = JSON.parse(
          sessionStorage.getItem("amigosTurmaSessaoDemo"),
        );
        if (sessao && sessao.email) emailSessao = sessao.email;
      } catch (erro) {
        emailSessao = "";
      }
      const emailBusca = emailSessao || email.value.trim();
      let dados = JSON.parse(localStorage.getItem(chaveDoacao(emailBusca)));
      if (!dados && emailBusca) {
        const legado = JSON.parse(localStorage.getItem("doacaoRecorrente"));
        if (
          legado &&
          String(legado.email || "")
            .trim()
            .toLowerCase() === String(emailBusca).toLowerCase()
        ) {
          dados = legado;
          localStorage.setItem(chaveDoacao(emailBusca), JSON.stringify(legado));
        }
      }

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

    [valorExtra, frequencia, nome, email].forEach(function (campo) {
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

    $("rec-previa-frequencia").textContent = frequencias[frequencia.value]
      ? `Frequência: ${frequencias[frequencia.value]}.`
      : "Selecione a frequência da doação.";

    const concluidas = [
      valor !== null && valor >= 10,
      Boolean(frequencias[frequencia.value]),
      nomeValido() && emailValido(),
      concluida,
    ];

    let atual = false;

    etapas.forEach(function (etapa, i) {
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
    const ativa = doacao && doacao.status === "ativa";

    resumo.hidden = !ativa;
    const estadoVazio = $("rec-vazio");
    if (estadoVazio) estadoVazio.hidden = ativa;
    form.hidden = ativa && !editando;
    $("rec-editar").hidden = !ativa;
    $("rec-cancelar").hidden = !ativa;

    if (ativa) {
      $("rec-resumo-valor").textContent = moeda(doacao.valor);
      $("rec-resumo-frequencia").textContent = frequencias[doacao.frequencia];
      $("rec-resumo-nome").textContent = doacao.nome;
      $("rec-resumo-status").textContent = "Ativa";
    }

    if (ativa) {
      status.textContent = "Sua contribuição está ativa nesta simulação.";
    } else if (doacao && doacao.status === "cancelada") {
      status.textContent = "Sua recorrência foi cancelada nesta simulação.";
    } else {
      status.textContent = "Nenhuma doação recorrente cadastrada.";
    }

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

    let mensagensErro = "";
    for (let i = 0; i < erros.length; i++) {
      mensagensErro = mensagensErro + erros[i].mensagem + " ";
    }
    erro.textContent = mensagensErro.trim();
    if (erros.length > 0) erros[0].campo.focus();

    return erros.length === 0;
  }

  // Eventos dos campos
  radios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      valorExtra.value = "";
      limparErros();
      atualizarInteratividade();
    });
  });

  valorExtra.addEventListener("input", function () {
    radios.forEach(function (radio) {
      radio.checked = false;
    });
    limparErros();
    atualizarInteratividade();
  });

  valorExtra.addEventListener("blur", function () {
    if (
      valorExtra.value.trim() &&
      (obterValor() === null ? 0 : obterValor()) < 10
    ) {
      valorExtra.classList.add("erro");
      erro.textContent = "Digite um valor válido de no mínimo R$ 10,00.";
    }
  });

  [frequencia, nome, email].forEach(function (campo) {
    campo.addEventListener("input", function () {
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
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!validar()) return;

    const eraEdicao = editando;

    doacao = {
      valor: obterValor(),
      frequencia: frequencia.value,
      nome: nome.value.trim(),
      email: email.value.trim(),
      status: "ativa",
    };

    editando = false;
    concluida = true;

    const salvou = salvar();
    if (!eraEdicao) {
      try {
        const chaveHistorico =
          "historicoDoacoes_" + doacao.email.trim().toLowerCase();
        const historico =
          JSON.parse(localStorage.getItem(chaveHistorico)) || [];
        historico.push({
          data: new Date().toISOString(),
          tipo: "Recorrente",
          valor: Number(doacao.valor),
          status: "Demonstrativa",
        });
        localStorage.setItem(chaveHistorico, JSON.stringify(historico));
      } catch (erro) {
        /* O registro é opcional nesta simulação. */
      }
    }
    form.reset();
    botaoConfirmar.textContent = "Confirmar doação recorrente";

    atualizarTela();
    mostrarConfirmacao(eraEdicao);

    status.textContent = salvou
      ? "Doação registrada com sucesso nesta simulação."
      : "Doação simulada, mas não foi possível salvá-la no navegador.";
  });

  // Editar doação
  $("rec-editar").addEventListener("click", function () {
    if (!doacao || doacao.status !== "ativa") return;

    confirmacao.hidden = true;
    editando = true;
    concluida = false;

    nome.value = doacao.nome;
    email.value = doacao.email;
    frequencia.value = doacao.frequencia;

    radios.forEach(function (radio) {
      radio.checked = Number(radio.value) === doacao.valor;
    });

    let valorSelecionado = false;
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) valorSelecionado = true;
    }
    valorExtra.value = valorSelecionado
      ? ""
      : String(doacao.valor).replace(".", ",");

    botaoConfirmar.textContent = "Salvar alterações";
    limparErros();
    atualizarTela();
    form.scrollIntoView({ behavior: "smooth" });
  });

  // Cancelar recorrência
  $("rec-cancelar").addEventListener("click", function () {
    if (!doacao || doacao.status !== "ativa") return;

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
  $("rec-nova-doacao").addEventListener("click", function () {
    confirmacao.hidden = true;
    concluida = false;
    editando = doacao && doacao.status === "ativa";

    form.reset();
    limparErros();
    botaoConfirmar.textContent = "Confirmar doação recorrente";

    atualizarTela();
    status.textContent = "Preencha os dados para uma nova simulação.";
    form.scrollIntoView({ behavior: "smooth" });
  });

  // Preenche os dados da conta que já entrou nesta demonstração.
  try {
    const sessao = JSON.parse(sessionStorage.getItem("amigosTurmaSessaoDemo"));
    if (sessao) {
      nome.value = sessao.nome || "";
      email.value = sessao.email || "";
    }
  } catch (erro) {
    /* Cadastro manual continua disponível. */
  }

  // Inicialização
  carregar();
  confirmacao.hidden = true;
  atualizarTela();
});