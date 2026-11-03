const formularioContato = document.getElementById("form-contato");
const feedbackContato = document.getElementById("feedback-contato");

if (formularioContato && feedbackContato) {
  const campos = [
    {
      id: "nome",
      validar: function (valor) { return valor.trim().length >= 3; },
      mensagem: "Informe seu nome (mínimo de 3 caracteres)."
    },
    {
      id: "email",
      validar: function (valor) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()); },
      mensagem: "Digite um endereço de e-mail válido."
    },
    {
      id: "assunto",
      validar: function (valor) { return valor.trim().length > 0; },
      mensagem: "Informe o assunto da mensagem."
    },
    {
      id: "mensagem",
      validar: function (valor) { return valor.trim().length >= 10; },
      mensagem: "A mensagem deve ter pelo menos 10 caracteres."
    }
  ];

  function limparErro(campo) {
    const elemento = document.getElementById(campo.id);
    const erroAnterior = elemento.parentElement.querySelector(".mensagem-erro");

    elemento.classList.remove("erro");
    elemento.removeAttribute("aria-invalid");

    if (erroAnterior) erroAnterior.remove();
  }

  function mostrarErro(campo, mensagem) {
    const elemento = document.getElementById(campo.id);
    limparErro(campo);

    elemento.classList.add("erro");
    elemento.setAttribute("aria-invalid", "true");

    const textoErro = document.createElement("span");
    textoErro.className = "mensagem-erro";
    textoErro.textContent = mensagem;
    elemento.insertAdjacentElement("afterend", textoErro);
  }

  campos.forEach(function (campo) {
    const elemento = document.getElementById(campo.id);

    if (elemento) {
      elemento.addEventListener("input", function () {
        limparErro(campo);
        feedbackContato.textContent = "";
        feedbackContato.className = "feedback-contato";
      });
    }
  });

  formularioContato.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let primeiroCampoInvalido = null;

    campos.forEach(function (campo) {
      const elemento = document.getElementById(campo.id);
      const valor = elemento ? elemento.value : "";

      limparErro(campo);

      if (!campo.validar(valor)) {
        mostrarErro(campo, campo.mensagem);
        if (!primeiroCampoInvalido) primeiroCampoInvalido = elemento;
      }
    });

    if (primeiroCampoInvalido) {
      feedbackContato.textContent = "Revise os campos destacados antes de continuar.";
      feedbackContato.className = "feedback-contato mensagem-erro-geral";
      primeiroCampoInvalido.focus();
      return;
    }

    feedbackContato.textContent =
      "Mensagem validada com sucesso! Este é um envio demonstrativo; nenhuma mensagem real foi enviada.";
    feedbackContato.className = "feedback-contato mensagem-sucesso";
    formularioContato.reset();
  });
}
