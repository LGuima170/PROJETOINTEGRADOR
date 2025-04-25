document.querySelector('.button').addEventListener('click', async () => {
    const usuario = document.querySelector('input[type="text"]').value;
    const senha = document.querySelector('input[type="password"]').value;

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
});