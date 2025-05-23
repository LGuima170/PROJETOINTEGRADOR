
*(ajuste a versão conforme necessário)*

---

### 4. `app.py`

```python
from flask import Flask, request, redirect, url_for, flash, render_template

app = Flask(__name__)
app.secret_key = 'troque_essa_chave_por_uma_aleatoria_e_secreta'

def update_user_password(user_id: int, new_password: str):
    """
    TODO: implementar hashing e atualização da senha no banco de dados.
    Exemplo (pseudo):
      password_hash = hash_password(new_password)
      db.execute("UPDATE users SET password = ? WHERE id = ?", (password_hash, user_id))
    """
    pass

@app.route('/criar-senha', methods=['GET', 'POST'])
def reset_password():
    if request.method == 'POST':
        nova = request.form.get('nova_senha', '')
        confirma = request.form.get('confirmar_senha', '')

        if not nova or not confirma:
            flash('Ambos os campos são obrigatórios.')
            return redirect(url_for('reset_password'))

        if nova != confirma:
            flash('As senhas não conferem.')
            return redirect(url_for('reset_password'))

        if len(nova) < 6:
            flash('A senha deve ter ao menos 6 caracteres.')
            return redirect(url_for('reset_password'))

        # Aqui você obteria o ID do usuário via sessão ou token de reset
        exemplo_user_id = 123
        update_user_password(exemplo_user_id, nova)
        flash('Senha atualizada com sucesso!')
        return redirect(url_for('login'))

    return render_template('reset_password.html')

@app.route('/login')
def login():
    return '<h2>Página de login</h2>'

if __name__ == '__main__':
    app.run(debug=True)
