/* Autenticação simulada para fins acadêmicos. Não usar dados ou senhas reais. */
(function () {
  const CHAVE_CONTAS = "amigosTurmaContasDemo";
  const CHAVE_SESSAO = "amigosTurmaSessaoDemo";
  const pagina = window.location.pathname;
  const paginaMeuImpacto = pagina.endsWith("/meu-impacto.html");
  const paginaAcesso = pagina.endsWith("/acesso-doador.html");

  function lerContas() {
    try {
      const contas = JSON.parse(localStorage.getItem(CHAVE_CONTAS));
      return Array.isArray(contas) ? contas : [];
    } catch (erro) {
      return [];
    }
  }

  function lerSessao() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO));
    } catch (erro) {
      return null;
    }
  }

  function iniciarSessao(conta) {
    sessionStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify({
        nome: conta.nome,
        email: conta.email,
        criadoEm: conta.criadoEm,
      }),
    );
  }

  function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem-acesso");
    if (!mensagem) return;
    mensagem.textContent = texto;
    mensagem.className = "mensagem-acesso " + tipo;
  }

  // Impede o acesso direto à área pessoal sem uma sessão demonstrativa.
  if (paginaMeuImpacto && !lerSessao()) {
    window.location.replace("./acesso-doador.html?retorno=meu-impacto");
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (paginaAcesso) configurarAcesso();
    if (paginaMeuImpacto) configurarAreaDoador();
  });

  function configurarAcesso() {
    const abaEntrar = document.getElementById("aba-entrar");
    const abaCadastro = document.getElementById("aba-cadastro");
    const formEntrar = document.getElementById("form-entrar");
    const formCadastro = document.getElementById("form-cadastro");
    const formRecuperacao = document.getElementById("form-recuperacao");
    if (!abaEntrar || !formEntrar) return;

    if (lerSessao()) {
      window.location.replace("./meu-impacto.html");
      return;
    }

    function selecionarAba(tipo) {
      const entrar = tipo === "entrar";
      formEntrar.hidden = !entrar;
      formCadastro.hidden = entrar;
      formRecuperacao.hidden = true;
      abaEntrar.classList.toggle("ativa", entrar);
      abaCadastro.classList.toggle("ativa", !entrar);
      abaEntrar.setAttribute("aria-selected", String(entrar));
      abaCadastro.setAttribute("aria-selected", String(!entrar));
      mostrarMensagem("", "");
    }

    abaEntrar.addEventListener("click", () => selecionarAba("entrar"));
    abaCadastro.addEventListener("click", () => selecionarAba("cadastro"));

    formEntrar.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const email = document
        .getElementById("login-email")
        .value.trim()
        .toLowerCase();
      const senha = document.getElementById("login-senha").value;
      const conta = lerContas().find(
        (item) => item.email === email && item.senha === senha,
      );
      if (!conta) {
        mostrarMensagem(
          "E-mail ou senha não conferem. Verifique os dados ou crie uma conta de demonstração.",
          "erro",
        );
        return;
      }
      iniciarSessao(conta);
      mostrarMensagem("Acesso realizado! Abrindo sua área...", "sucesso");
      window.location.href = "./meu-impacto.html";
    });

    formCadastro.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const nome = document
        .getElementById("cadastro-nome")
        .value.trim()
        .replace(/\s+/g, " ");
      const email = document
        .getElementById("cadastro-email")
        .value.trim()
        .toLowerCase();
      const senha = document.getElementById("cadastro-senha").value;
      const confirmar = document.getElementById("cadastro-confirmar").value;
      if (nome.split(" ").length < 2) {
        mostrarMensagem("Digite seu nome e sobrenome.", "erro");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarMensagem("Digite um e-mail válido.", "erro");
        return;
      }
      if (senha.length < 6) {
        mostrarMensagem("A senha precisa ter pelo menos 6 caracteres.", "erro");
        return;
      }
      if (senha !== confirmar) {
        mostrarMensagem("As senhas não são iguais.", "erro");
        return;
      }
      const contas = lerContas();
      if (contas.some((item) => item.email === email)) {
        mostrarMensagem(
          "Já existe uma conta de demonstração com esse e-mail. Entre ou recupere a senha.",
          "erro",
        );
        return;
      }
      const conta = { nome, email, senha, criadoEm: new Date().toISOString() };
      contas.push(conta);
      try {
        localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
        iniciarSessao(conta);
        window.location.href = "./meu-impacto.html";
      } catch (erro) {
        mostrarMensagem(
          "Não foi possível salvar a conta neste navegador.",
          "erro",
        );
      }
    });

    document
      .getElementById("abrir-recuperacao")
      .addEventListener("click", function () {
        formEntrar.hidden = true;
        formCadastro.hidden = true;
        formRecuperacao.hidden = false;
        abaEntrar.classList.remove("ativa");
        abaCadastro.classList.remove("ativa");
        mostrarMensagem("", "");
      });

    document
      .getElementById("voltar-login")
      .addEventListener("click", () => selecionarAba("entrar"));
    formRecuperacao.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const email = document
        .getElementById("recuperar-email")
        .value.trim()
        .toLowerCase();
      const senha = document.getElementById("recuperar-senha").value;
      if (senha.length < 6) {
        mostrarMensagem(
          "A nova senha precisa ter pelo menos 6 caracteres.",
          "erro",
        );
        return;
      }
      const contas = lerContas();
      const conta = contas.find((item) => item.email === email);
      if (!conta) {
        mostrarMensagem(
          "Não encontramos uma conta com esse e-mail neste navegador.",
          "erro",
        );
        return;
      }
      conta.senha = senha;
      try {
        localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
        mostrarMensagem(
          "Senha atualizada nesta demonstração. Você já pode entrar.",
          "sucesso",
        );
        selecionarAba("entrar");
        document.getElementById("login-email").value = email;
      } catch (erro) {
        mostrarMensagem("Não foi possível atualizar a senha.", "erro");
      }
    });
  }

  function configurarAreaDoador() {
    const sessao = lerSessao();
    if (!sessao) return;
    const primeiroNome = sessao.nome.split(/\s+/)[0];
    const nomeBoasVindas = document.getElementById("doador-nome");
    const nomePerfil = document.getElementById("perfil-doador-nome");
    const emailPerfil = document.getElementById("perfil-doador-email");
    const dataPerfil = document.getElementById("perfil-doador-data");
    const emailSessao = document.getElementById("doador-email-sessao");
    const tipoDoador = document.getElementById("perfil-doador-tipo");
    if (nomeBoasVindas) nomeBoasVindas.textContent = primeiroNome;
    if (nomePerfil) nomePerfil.textContent = sessao.nome;
    if (emailPerfil) emailPerfil.textContent = sessao.email;
    if (emailSessao) emailSessao.textContent = "Conectado como " + sessao.email;
    if (dataPerfil) {
      const data = new Date(sessao.criadoEm);
      dataPerfil.textContent = data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    }
    carregarHistoricoDoador(sessao.email);
    if (tipoDoador) {
      let recorrencia = null;
      try {
        recorrencia = JSON.parse(
          localStorage.getItem(
            "doacaoRecorrente_" + sessao.email.toLowerCase(),
          ),
        );
      } catch (erro) {
        recorrencia = null;
      }
      let historico = [];
      try {
        historico =
          JSON.parse(
            localStorage.getItem(
              "historicoDoacoes_" + sessao.email.toLowerCase(),
            ),
          ) || [];
      } catch (erro) {
        historico = [];
      }
      tipoDoador.textContent =
        recorrencia && recorrencia.status === "ativa"
          ? "Recorrente"
          : historico.length
            ? "Pontual"
            : "Ainda não realizou doações";
    }
    const sair = document.getElementById("sair-conta-doador");
    if (sair)
      sair.addEventListener("click", function () {
        sessionStorage.removeItem(CHAVE_SESSAO);
        window.location.href = "./acesso-doador.html";
      });
  }

  function carregarHistoricoDoador(email) {
    const chave = "historicoDoacoes_" + String(email).trim().toLowerCase();
    let historico = [];
    try {
      const dados = JSON.parse(localStorage.getItem(chave));
      if (Array.isArray(dados)) historico = dados;
    } catch (erro) {
      historico = [];
    }

    const corpo = document.getElementById("lista-doacoes");
    if (!corpo) return;
    corpo.textContent = "";
    const moeda = (valor) =>
      Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    const total = historico.reduce(
      (soma, item) => soma + (Number(item.valor) || 0),
      0,
    );
    const meses = new Set(
      historico.map((item) => {
        const data = new Date(item.data);
        return data.getFullYear() + "-" + data.getMonth();
      }),
    );

    historico
      .slice()
      .reverse()
      .forEach((item) => {
        const linha = document.createElement("tr");
        const valores = [
          new Date(item.data).toLocaleDateString("pt-BR"),
          item.tipo || "Doação",
          moeda(item.valor),
          "Demonstrativa",
        ];
        valores.forEach((valor, indice) => {
          const celula = document.createElement("td");
          celula.textContent = valor;
          if (indice === 3) {
            const status = document.createElement("span");
            status.className = "status-concluido";
            status.textContent = valor;
            celula.textContent = "";
            celula.appendChild(status);
          }
          linha.appendChild(celula);
        });
        corpo.appendChild(linha);
      });

    if (!historico.length) {
      const linha = document.createElement("tr");
      const celula = document.createElement("td");
      celula.colSpan = 4;
      celula.textContent = "Nenhuma contribuição registrada nesta conta ainda.";
      linha.appendChild(celula);
      corpo.appendChild(linha);
    }

    const totalEl = document.getElementById("doador-total-doado");
    const quantidadeEl = document.getElementById("doador-total-doacoes");
    const mesesEl = document.getElementById("doador-meses-apoio");
    if (totalEl) totalEl.textContent = moeda(total);
    if (quantidadeEl) quantidadeEl.textContent = String(historico.length);
    if (mesesEl)
      mesesEl.textContent = meses.size + (meses.size === 1 ? " mês" : " meses");
  }
})();