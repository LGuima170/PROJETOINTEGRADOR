// === LOGIN (telalogin.html) ===
function setupLogin() {
  const botao = document.querySelector('.button');
  const inputUsuario = document.querySelector('input[type="text"]');
  const inputSenha = document.querySelector('input[type="password"]');

  if (!botao || !inputUsuario || !inputSenha) return;

  botao.addEventListener('click', async () => {
    const usuario = inputUsuario.value.trim();
    const senha = inputSenha.value;

    if (!usuario || !senha) {
      alert('Preencha usuário e senha.');
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = result.redirectUrl;
      } else {
        alert(result.message || 'Erro no login');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
    }
  });
}

// === RECUPERAÇÃO DE SENHA (Esqueci a senha.html) ===
function setupEsqueciSenha() {
  const botao = document.querySelector('.button');
  const emailInput = document.getElementById('email');

  if (!botao || !emailInput) return;

  botao.addEventListener('click', async () => {
    const email = emailInput.value.trim();

    if (!email) {
      alert('Informe um e-mail válido.');
      return;
    }

    try {
      const res = await fetch('/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await res.json();

      if (result.success) {
        localStorage.setItem('usuarioRecuperacao', result.usuario);
        window.location.href = result.redirectUrl;
      } else {
        alert(result.message || 'Erro ao recuperar senha.');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
    }
  });
}

// === Executar scripts apropriados conforme a página ===
window.addEventListener('DOMContentLoaded', () => {
  setupLogin();
  setupEsqueciSenha();
});
