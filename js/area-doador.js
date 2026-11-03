const botaoHistorico = document.getElementById("alternar-historico");
const tabelaDoacoes = document.querySelector(".tabela-doacoes");
const estadoVazio = document.getElementById("estado-vazio");

if (botaoHistorico && tabelaDoacoes && estadoVazio) {
  botaoHistorico.addEventListener("click", function () {
    // Verifica se o estado vazio está aparecendo
    const historicoEstaVazio = !estadoVazio.hidden;

    if (historicoEstaVazio) {
      // Mostra novamente a tabela
      tabelaDoacoes.hidden = false;
      estadoVazio.hidden = true;

      botaoHistorico.textContent = "Simular histórico vazio";
    } else {
      // Esconde a tabela e mostra o estado vazio
      tabelaDoacoes.hidden = true;
      estadoVazio.hidden = false;

      botaoHistorico.textContent = "Restaurar histórico";
    }
  });
}

// PREFERÊNCIAS DE COMUNICAÇÃO

const formulario = document.getElementById("form-preferencias");

const mensagemFeedback = document.getElementById("mensagem-feedback");

const receberNovidades = document.getElementById("receber-novidades");
const receberCampanhas = document.getElementById("receber-campanhas");
const receberImpacto = document.getElementById("receber-impacto");

const consentimento = document.getElementById("consentimento-dados");

// Função para mostrar mensagens ao usuário
function mostrarMensagem(texto, tipo) {
  mensagemFeedback.textContent = texto;

  mensagemFeedback.className = "mensagem-feedback " + tipo;
}

// Evento de envio do formulário
if (formulario && mensagemFeedback) {
  formulario.addEventListener("submit", function (evento) {
    // Impede o recarregamento da página
    evento.preventDefault();

    // Verifica se alguma comunicação foi selecionada
    const algumaOpcaoSelecionada =
      receberNovidades.checked ||
      receberCampanhas.checked ||
      receberImpacto.checked;

    // Exige consentimento quando houver comunicações
    if (algumaOpcaoSelecionada && !consentimento.checked) {
      mostrarMensagem(
        "Para receber comunicações, autorize o uso dos dados de contato.",
        "erro",
      );

      return;
    }

    // Organiza as preferências fictícias
    const preferencias = {
      novidades: receberNovidades.checked,
      campanhas: receberCampanhas.checked,
      impacto: receberImpacto.checked,
      consentimento: consentimento.checked,
    };

    console.log("Preferências demonstrativas:", preferencias);

    // Exibe mensagem de sucesso
    mostrarMensagem(
      "Preferências registradas com sucesso nesta demonstração!",
      "sucesso",
    );
  });
}
