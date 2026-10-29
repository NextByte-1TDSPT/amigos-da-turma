// Doação pontual: validação, etapas do fluxo e confirmação demonstrativa

const VALOR_MINIMO = 10;

const form = document.getElementById("form-doacao");
const campoOutroValor = document.getElementById("outro-valor");
const radiosValor = document.querySelectorAll('input[name="valor"]');
const radiosPagamento = document.querySelectorAll('input[name="pagamento"]');
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const resumoValor = document.getElementById("resumo-valor");
const dicaPagamento = document.getElementById("dica-pagamento");
const confirmacao = document.getElementById("confirmacao");
const etapas = document.querySelectorAll("#etapas li");

let doacaoEnviada = false;

// Textos de cada forma de pagamento (tudo demonstrativo)
const pagamentos = {
  pix: {
    nome: "Pix",
    dica: "Pix: pagamento instantâneo. Na versão real, um QR Code seria exibido aqui.",
    detalhe: "Em um cenário real, o QR Code Pix apareceria agora para o pagamento imediato.",
  },
  boleto: {
    nome: "Boleto",
    dica: "Boleto: pagamento em banco ou aplicativo. Na versão real, o boleto seria gerado aqui.",
    detalhe: "Em um cenário real, o boleto com código de barras seria gerado agora.",
  },
};

function formatarReais(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Lê o valor escolhido (botões) ou digitado (outro valor)
function obterValor() {
  const digitado = campoOutroValor.value.trim();

  if (digitado !== "") {
    if (!/^\d+([.,]\d{1,2})?$/.test(digitado)) {
      return { numero: null, erro: "Digite um valor válido. Ex.: 75 ou 75,50." };
    }
    const numero = Number(digitado.replace(",", "."));
    if (numero < VALOR_MINIMO) {
      return { numero: null, erro: "O valor mínimo para doação é R$ 10,00." };
    }
    return { numero: numero, erro: "" };
  }

  const marcado = document.querySelector('input[name="valor"]:checked');
  if (marcado) {
    return { numero: Number(marcado.value), erro: "" };
  }
  return { numero: null, erro: "Escolha um valor ou digite outro valor." };
}

function obterPagamento() {
  const marcado = document.querySelector('input[name="pagamento"]:checked');
  return marcado ? marcado.value : null;
}

function nomeValido() {
  return campoNome.value.trim().split(/\s+/).length >= 2;
}

function emailValido() {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campoEmail.value.trim());
}

function mostrarErro(idMensagem, campo, texto) {
  document.getElementById(idMensagem).textContent = texto;
  if (campo) {
    campo.classList.add("erro");
  }
}

function limparErros() {
  document.querySelectorAll(".mensagem-erro").forEach(function (m) {
    m.textContent = "";
  });
  document.querySelectorAll(".erro").forEach(function (c) {
    c.classList.remove("erro");
  });
}

// Validações (cada uma mostra a sua mensagem e devolve true ou false)
function validarValor() {
  const v = obterValor();
  const digitou = campoOutroValor.value.trim() !== "";
  if (v.erro !== "") {
    mostrarErro("erro-valor", digitou ? campoOutroValor : null, v.erro);
    return false;
  }
  return true;
}

function validarPagamento() {
  if (obterPagamento() === null) {
    mostrarErro("erro-pagamento", null, "Escolha Pix ou boleto.");
    return false;
  }
  return true;
}

function validarNome() {
  if (!nomeValido()) {
    mostrarErro("erro-nome", campoNome, "Digite seu nome completo (nome e sobrenome).");
    return false;
  }
  return true;
}

function validarEmail() {
  if (!emailValido()) {
    mostrarErro("erro-email", campoEmail, "Digite um e-mail válido. Ex.: nome@dominio.com");
    return false;
  }
  return true;
}

// Mostra "Você vai doar R$ X" quando o valor é válido
function atualizarResumo() {
  const v = obterValor();
  resumoValor.textContent = v.erro === "" ? "Você vai doar " + formatarReais(v.numero) : "";
}

function atualizarDica() {
  const p = obterPagamento();
  dicaPagamento.textContent = p ? pagamentos[p].dica : "Escolha como deseja pagar.";
}

// Barra de etapas: concluídas em verde, etapa atual em laranja
function atualizarEtapas() {
  const concluidas = [
    obterValor().erro === "",
    obterPagamento() !== null,
    nomeValido() && emailValido(),
    doacaoEnviada,
  ];
  let achouAtual = false;

  etapas.forEach(function (etapa, i) {
    etapa.classList.remove("ativa", "concluida");
    if (concluidas[i]) {
      etapa.classList.add("concluida");
    } else if (!achouAtual) {
      etapa.classList.add("ativa");
      achouAtual = true;
    }
  });
}

// Ao escolher um valor pronto, o campo "outro valor" é limpo
radiosValor.forEach(function (radio) {
  radio.addEventListener("change", function () {
    campoOutroValor.value = "";
    limparErros();
    atualizarResumo();
    atualizarEtapas();
  });
});

// Ao digitar outro valor, os botões de valor são desmarcados
campoOutroValor.addEventListener("input", function () {
  radiosValor.forEach(function (radio) {
    radio.checked = false;
  });
  document.getElementById("erro-valor").textContent = "";
  campoOutroValor.classList.remove("erro");
  atualizarResumo();
  atualizarEtapas();
});

campoOutroValor.addEventListener("blur", function () {
  if (campoOutroValor.value.trim() !== "") {
    validarValor();
  }
});

radiosPagamento.forEach(function (radio) {
  radio.addEventListener("change", function () {
    document.getElementById("erro-pagamento").textContent = "";
    atualizarDica();
    atualizarEtapas();
  });
});

campoNome.addEventListener("input", function () {
  document.getElementById("erro-nome").textContent = "";
  campoNome.classList.remove("erro");
  atualizarEtapas();
});

campoEmail.addEventListener("input", function () {
  document.getElementById("erro-email").textContent = "";
  campoEmail.classList.remove("erro");
  atualizarEtapas();
});

function mostrarConfirmacao() {
  const valor = obterValor().numero;
  const pagamento = pagamentos[obterPagamento()];
  const primeiroNome = campoNome.value.trim().split(/\s+/)[0];

  document.getElementById("conf-texto").textContent =
    "Obrigado, " + primeiroNome + "! Veja o resumo da sua doação pontual.";
  document.getElementById("conf-valor").textContent = formatarReais(valor);
  document.getElementById("conf-pagamento").textContent = pagamento.nome;
  document.getElementById("conf-detalhe").textContent = pagamento.detalhe;
  document.getElementById("conf-email").textContent =
    "Um e-mail de confirmação seria enviado para " + campoEmail.value.trim() + ".";

  form.hidden = true;
  confirmacao.hidden = false;
  confirmacao.scrollIntoView({ behavior: "smooth", block: "center" });
  confirmacao.focus();
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  limparErros();

  // Todas as validações rodam para mostrar todos os erros de uma vez
  const okValor = validarValor();
  const okPagamento = validarPagamento();
  const okNome = validarNome();
  const okEmail = validarEmail();

  if (!okValor || !okPagamento || !okNome || !okEmail) {
    if (!okValor) {
      campoOutroValor.focus();
    } else if (!okPagamento) {
      radiosPagamento[0].focus();
    } else if (!okNome) {
      campoNome.focus();
    } else {
      campoEmail.focus();
    }
    return;
  }

  doacaoEnviada = true;
  mostrarConfirmacao();
  atualizarEtapas();
});

// Botão "Fazer nova simulação" volta ao início do fluxo
document.getElementById("nova-doacao").addEventListener("click", function () {
  form.reset();
  limparErros();
  doacaoEnviada = false;
  confirmacao.hidden = true;
  form.hidden = false;
  atualizarResumo();
  atualizarDica();
  atualizarEtapas();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

atualizarResumo();
atualizarDica();
atualizarEtapas();
