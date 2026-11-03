// Dashboard demonstrativo: todos os números abaixo são fictícios.
const dadosMensais = [
  {
    mes: "Jan",
    nome: "Janeiro",
    arrecadacao: 4200,
    doacoes: 34,
    doadores: 27,
    recorrentes: 16,
  },
  {
    mes: "Fev",
    nome: "Fevereiro",
    arrecadacao: 4650,
    doacoes: 38,
    doadores: 29,
    recorrentes: 18,
  },
  {
    mes: "Mar",
    nome: "Março",
    arrecadacao: 5100,
    doacoes: 41,
    doadores: 32,
    recorrentes: 20,
  },
  {
    mes: "Abr",
    nome: "Abril",
    arrecadacao: 4850,
    doacoes: 39,
    doadores: 30,
    recorrentes: 19,
  },
  {
    mes: "Mai",
    nome: "Maio",
    arrecadacao: 5600,
    doacoes: 45,
    doadores: 35,
    recorrentes: 22,
  },
  {
    mes: "Jun",
    nome: "Junho",
    arrecadacao: 5900,
    doacoes: 48,
    doadores: 37,
    recorrentes: 24,
  },
  {
    mes: "Jul",
    nome: "Julho",
    arrecadacao: 6200,
    doacoes: 51,
    doadores: 40,
    recorrentes: 26,
  },
  {
    mes: "Ago",
    nome: "Agosto",
    arrecadacao: 6100,
    doacoes: 49,
    doadores: 38,
    recorrentes: 25,
  },
  {
    mes: "Set",
    nome: "Setembro",
    arrecadacao: 6800,
    doacoes: 55,
    doadores: 43,
    recorrentes: 29,
  },
  {
    mes: "Out",
    nome: "Outubro",
    arrecadacao: 7250,
    doacoes: 59,
    doadores: 46,
    recorrentes: 31,
  },
  {
    mes: "Nov",
    nome: "Novembro",
    arrecadacao: 0,
    doacoes: 0,
    doadores: 0,
    recorrentes: 0,
  },
  {
    mes: "Dez",
    nome: "Dezembro",
    arrecadacao: 0,
    doacoes: 0,
    doadores: 0,
    recorrentes: 0,
  },
];

const filtroPeriodo = document.getElementById("filtro-periodo");
const botaoAtualizar = document.getElementById("btn-atualizar-dashboard");
const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const formatoInteiro = new Intl.NumberFormat("pt-BR");

function obterMesesDoPeriodo(periodo) {
  if (periodo == "semestre1") return dadosMensais.slice(0, 6);
  if (periodo == "semestre2") return dadosMensais.slice(6, 12);
  if (periodo == "trimestre3") return dadosMensais.slice(6, 9);
  if (periodo == "outubro") return dadosMensais.slice(9, 10);
  return dadosMensais;
}

function somar(meses, propriedade) {
  let total = 0;
  for (let i = 0; i < meses.length; i++) {
    total = total + meses[i][propriedade];
  }
  return total;
}

function atualizarIndicadores(meses) {
  const arrecadacao = somar(meses, "arrecadacao");
  const doacoes = somar(meses, "doacoes");
  const totalDoadoresMes = somar(meses, "doadores");
  const totalRecorrentesMes = somar(meses, "recorrentes");
  const mediaDoadores = meses.length
    ? Math.round(totalDoadoresMes / meses.length)
    : 0;
  const mediaRecorrentes = meses.length
    ? Math.round(totalRecorrentesMes / meses.length)
    : 0;
  const mediaPontuais = Math.max(mediaDoadores - mediaRecorrentes, 0);
  // Retenção demonstrativa: doadores recorrentes no mês atual que retornaram
  // em relação ao total de doadores ativos no mês imediatamente anterior.
  // O primeiro mês do histórico não entra no cálculo por não ter mês-base.
  const indicesMeses = meses
    .map((mes) => dadosMensais.indexOf(mes))
    .filter((indice) => indice > 0);
  const totalDoadoresMesAnterior = indicesMeses.reduce(
    (total, indice) => total + dadosMensais[indice - 1].doadores,
    0,
  );
  const totalDoadoresRetidos = indicesMeses.reduce(
    (total, indice) => total + dadosMensais[indice].recorrentes,
    0,
  );
  const taxaRetencao = totalDoadoresMesAnterior > 0
    ? Math.round((totalDoadoresRetidos / totalDoadoresMesAnterior) * 100)
    : 0;

  document.getElementById("kpi-arrecadado").textContent =
    formatoMoeda.format(arrecadacao);
  document.getElementById("kpi-doacoes").textContent =
    formatoInteiro.format(doacoes);
  document.getElementById("kpi-doadores").textContent =
    formatoInteiro.format(mediaDoadores);
  document.getElementById("kpi-retencao").textContent = `${taxaRetencao}%`;
  document.getElementById("resumo-retencao").textContent = `${taxaRetencao}%`;
  document.getElementById("qtd-recorrentes").textContent =
    formatoInteiro.format(mediaRecorrentes);
  document.getElementById("qtd-pontuais").textContent =
    formatoInteiro.format(mediaPontuais);
}

function atualizarGrafico(meses) {
  const grafico = document.getElementById("grafico-captacao");
  let maiorValor = 1;
  for (let i = 0; i < meses.length; i++) {
    if (meses[i].arrecadacao > maiorValor) maiorValor = meses[i].arrecadacao;
  }
  grafico.innerHTML = "";

  meses.forEach(function (item) {
    const coluna = document.createElement("div");
    coluna.className = "bar-item";
    const valor = document.createElement("span");
    valor.className = "bar-value";
    valor.textContent = item.arrecadacao
      ? `${(item.arrecadacao / 1000).toFixed(1).replace(".", ",")} mil`
      : "—";
    const barra = document.createElement("div");
    barra.className = "bar-column";
    barra.style.height = `${item.arrecadacao ? Math.max((item.arrecadacao / maiorValor) * 145, 5) : 5}px`;
    barra.setAttribute("aria-hidden", "true");
    const mes = document.createElement("span");
    mes.className = "bar-month";
    mes.textContent = item.mes;
    coluna.append(valor, barra, mes);
    grafico.appendChild(coluna);
  });

  document.getElementById("legenda-grafico").textContent =
    "Arrecadação mensal fictícia em reais. Meses futuros aparecem sem movimentação registrada.";
}

function atualizarTabela(meses) {
  const corpo = document.getElementById("tabela-dashboard");
  corpo.innerHTML = "";
  meses.forEach(function (item) {
    const linha = document.createElement("tr");
    [
      ["Mês", item.nome],
      ["Arrecadação", formatoMoeda.format(item.arrecadacao)],
      ["Doações", formatoInteiro.format(item.doacoes)],
      ["Doadores", formatoInteiro.format(item.doadores)],
      ["Recorrentes", formatoInteiro.format(item.recorrentes)],
    ].forEach(function ([rotulo, valor], indice) {
      const celula = document.createElement("td");
      celula.dataset.label = rotulo;
      celula.textContent = valor;
      if (indice === 0) celula.classList.add("celula-mes");
      linha.appendChild(celula);
    });
    corpo.appendChild(linha);
  });
}

function atualizarDashboard() {
  const periodo = filtroPeriodo.value;
  const meses = obterMesesDoPeriodo(periodo);
  const nomesPeriodos = {
    ano: "Ano de 2026",
    semestre1: "1º semestre de 2026",
    semestre2: "2º semestre de 2026",
    trimestre3: "3º trimestre de 2026",
    outubro: "Outubro de 2026",
  };

  atualizarIndicadores(meses);
  atualizarGrafico(meses);
  atualizarTabela(meses);
  document.getElementById("periodo-atual").textContent = nomesPeriodos[periodo];
}

filtroPeriodo.addEventListener("change", atualizarDashboard);
botaoAtualizar.addEventListener("click", function () {
  atualizarDashboard();
  botaoAtualizar.innerHTML =
    '<i class="fa-solid fa-check" aria-hidden="true"></i> Painel atualizado';
  window.setTimeout(function () {
    botaoAtualizar.innerHTML =
      '<i class="fa-solid fa-rotate" aria-hidden="true"></i> Atualizar painel';
  }, 1400);
});

atualizarDashboard();

// Simulação visual de integração apenas, não realiza chamadas a APIs externas ainda.
const statusSalesforce = document.getElementById("status-salesforce");
const tituloStatusSalesforce = document.getElementById(
  "titulo-status-salesforce",
);
const mensagemStatusSalesforce = document.getElementById(
  "mensagem-status-salesforce",
);
const botaoSincronizarSalesforce = document.getElementById(
  "btn-sincronizar-salesforce",
);
const botaoFalhaSalesforce = document.getElementById("btn-falha-salesforce");
const ultimaSincronizacao = document.getElementById("ultima-sincronizacao");

function exibirStatusSalesforce(tipo, titulo, mensagem, icone) {
  statusSalesforce.className =
    `salesforce-status ${tipo ? `status-${tipo}` : ""}`.trim();
  statusSalesforce.querySelector("i").className = `fa-solid ${icone}`;
  tituloStatusSalesforce.textContent = titulo;
  mensagemStatusSalesforce.textContent = mensagem;
}

function definirBotoesSalesforce(bloqueados) {
  botaoSincronizarSalesforce.disabled = bloqueados;
  botaoFalhaSalesforce.disabled = bloqueados;
}

function simularSincronizacao() {
  definirBotoesSalesforce(true);
  exibirStatusSalesforce(
    "loading",
    "Sincronizando...",
    "Aguarde enquanto a interface simula o processamento dos dados.",
    "fa-spinner fa-spin",
  );

  window.setTimeout(function () {
    exibirStatusSalesforce(
      "success",
      "Sincronização concluída (simulação)",
      "A demonstração terminou com sucesso. Nenhum dado foi enviado a um serviço externo.",
      "fa-circle-check",
    );
    ultimaSincronizacao.textContent = `Última simulação de sucesso: ${new Date().toLocaleString("pt-BR")}`;
    definirBotoesSalesforce(false);
  }, 1200);
}

function simularFalhaSincronizacao() {
  exibirStatusSalesforce(
    "error",
    "Falha na sincronização (simulação)",
    "Exemplo de retorno de erro: não foi possível concluir a comunicação. Verifique a conexão e tente novamente. Esta mensagem é demonstrativa.",
    "fa-triangle-exclamation",
  );
  ultimaSincronizacao.textContent = `Última simulação de falha: ${new Date().toLocaleString("pt-BR")}`;
}

botaoSincronizarSalesforce.addEventListener("click", simularSincronizacao);
botaoFalhaSalesforce.addEventListener("click", simularFalhaSincronizacao);