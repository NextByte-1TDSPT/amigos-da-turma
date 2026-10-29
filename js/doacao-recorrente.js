
document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("form-recorrente");
  const outroValor = document.getElementById("rec-outro-valor");
  const frequencia = document.getElementById("rec-frequencia");
  const nome = document.getElementById("rec-nome");
  const email = document.getElementById("rec-email");

  const erro = document.getElementById("rec-erro");
  const status = document.getElementById("rec-status");
  const resumo = document.getElementById("rec-resumo");

  const resumoValor = document.getElementById("rec-resumo-valor");
  const resumoFrequencia = document.getElementById("rec-resumo-frequencia");
  const resumoNome = document.getElementById("rec-resumo-nome");
  const resumoStatus = document.getElementById("rec-resumo-status");

  const botaoEditar = document.getElementById("rec-editar");
  const botaoCancelar = document.getElementById("rec-cancelar");
  const botaoConfirmar = document.getElementById("btn-confirmar-recorrencia");

  const valores = document.querySelectorAll(
    'input[name="rec-valor"]'
  );

  if (!formulario) return;

  const chaveArmazenamento = "doacaoRecorrente";

  let doacao = null;
  let editando = false;
  function formatarValor(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  // TRADUZIR FREQUÊNCIA
  function formatarFrequencia(tipo) {
    const frequencias = {
      mensal: "Mensal",
      trimestral: "Trimestral",
      anual: "Anual"
    };

    return frequencias[tipo] || tipo;
  }

  // SALVAR NO NAVEGADOR
  function salvarDoacao() {
    localStorage.setItem(
      chaveArmazenamento,
      JSON.stringify(doacao)
    );
  }

  // RECUPERAR DOAÇÃO SALVA
  function carregarDoacao() {
    const dadosSalvos = localStorage.getItem(chaveArmazenamento);

    if (dadosSalvos) {
      try {
        doacao = JSON.parse(dadosSalvos);
      } catch (e) {
        doacao = null;
      }
    }

    atualizarTela();
  }

  // ATUALIZAR AS INFORMAÇÕES DA TELA
  function atualizarTela() {

    if (!doacao) {
      resumo.hidden = true;
      formulario.hidden = false;

      status.textContent =
        "Nenhuma doação recorrente cadastrada.";

      return;
    }

    resumo.hidden = false;

    resumoValor.textContent = formatarValor(doacao.valor);
    resumoFrequencia.textContent = formatarFrequencia(
      doacao.frequencia
    );
    resumoNome.textContent = doacao.nome;

    if (doacao.status === "ativa") {

      resumoStatus.textContent = "Ativa";

      status.textContent =
        "Sua doação recorrente foi cadastrada com sucesso!";

      botaoEditar.hidden = false;
      botaoCancelar.hidden = false;

      if (!editando) {
        formulario.hidden = true;
      }

    } else {

      resumoStatus.textContent = "Cancelada";

      status.textContent =
        "Sua doação recorrente foi cancelada.";

      botaoEditar.hidden = true;
      botaoCancelar.hidden = true;

      formulario.hidden = false;
    }
  }

  // SELEÇÃO DE VALOR
  valores.forEach((radio) => {
    radio.addEventListener("change", () => {
      outroValor.value = "";
    });
  });

  outroValor.addEventListener("input", () => {
    valores.forEach((radio) => {
      radio.checked = false;
    });
  });

  // CADASTRAR OU EDITAR DOAÇÃO
  formulario.addEventListener("submit", (evento) => {

    evento.preventDefault();

    erro.textContent = "";

    // Verificar valor escolhido
    let valorSelecionado = null;

    valores.forEach((radio) => {
      if (radio.checked) {
        valorSelecionado = Number(radio.value);
      }
    });

    // Verificar valor personalizado
    if (outroValor.value.trim() !== "") {

      const valorDigitado = outroValor.value
        .trim()
        .replace(",", ".");

      if (!/^\d+(\.\d{1,2})?$/.test(valorDigitado)) {
        erro.textContent =
          "Digite um valor válido. Exemplo: 30 ou 30,50.";
        return;
      }

      valorSelecionado = Number(valorDigitado);
    }

    // Validar valor mínimo
    if (!valorSelecionado || valorSelecionado < 10) {
      erro.textContent =
        "Escolha um valor de no mínimo R$ 10,00.";
      return;
    }

    // Validar frequência
    if (frequencia.value === "") {
      erro.textContent =
        "Selecione a frequência da contribuição.";
      return;
    }

    // Validar nome
    if (nome.value.trim().split(/\s+/).length < 2) {
      erro.textContent =
        "Digite seu nome completo.";
      return;
    }

    // Validar e-mail
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email.value.trim())) {
      erro.textContent =
        "Digite um e-mail válido.";
      return;
    }

    // Criar ou atualizar a doação
    doacao = {
      valor: valorSelecionado,
      frequencia: frequencia.value,
      nome: nome.value.trim(),
      email: email.value.trim(),
      status: "ativa"
    };

    const eraEdicao = editando;

    editando = false;

    // Salvar os dados
    salvarDoacao();

    // Atualizar a tela
    atualizarTela();

    if (eraEdicao) {
      status.textContent =
        "Doação recorrente atualizada com sucesso!";
    } else {
      status.textContent =
        "Doação recorrente simulada com sucesso! " +
        "Nenhuma cobrança real foi realizada.";
    }

    // Limpar os campos
    formulario.reset();

  });

  // EDITAR DOAÇÃO
  botaoEditar.addEventListener("click", () => {

    if (!doacao || doacao.status !== "ativa") return;

    editando = true;

    formulario.hidden = false;

    // Preencher dados anteriores
    nome.value = doacao.nome;
    email.value = doacao.email;
    frequencia.value = doacao.frequencia;

    // Recuperar o valor
    let valorEncontrado = false;

    valores.forEach((radio) => {
      if (Number(radio.value) === doacao.valor) {
        radio.checked = true;
        valorEncontrado = true;
      } else {
        radio.checked = false;
      }
    });

    if (valorEncontrado) {
      outroValor.value = "";
    } else {
      outroValor.value = String(doacao.valor).replace(".", ",");
    }

    botaoConfirmar.textContent = "Salvar alterações";

    status.textContent =
      "Altere os dados e clique em Salvar alterações.";

    formulario.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

  // CANCELAR DOAÇÃO
  botaoCancelar.addEventListener("click", () => {

    if (!doacao || doacao.status !== "ativa") return;

    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar sua doação recorrente?"
    );

    if (!confirmar) return;

    doacao.status = "cancelada";

    editando = false;

    salvarDoacao();

    formulario.reset();
    botaoConfirmar.textContent = "Confirmar doação recorrente";

    atualizarTela();

    status.textContent =
      "Doação recorrente cancelada com sucesso! " +
      "Nenhuma cobrança foi realizada.";

  });

  // CARREGAR DADOS AO ABRIR A PÁGINA
  carregarDoacao();

});
