import { useState } from 'react';
import axios from 'axios';

function Cadastro() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username||!password){
      console.error("Nome de usuário ou senha nulos.")
      alert("Nome de usuário ou senha nulos.")
      return
    }
    try {
      const response = await axios.post('http://localhost:5000/cadastro', {
        username,
        password,
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      alert('Erro ao cadastrar usuário');
    }
  };

  return (
    <div className='container'>
      <form onSubmit={handleSubmit} className='container'>
        <h1>Cadastro</h1>
        <input 
          id='inpname'
          placeholder="Nome"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Senha"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type='submit'>Criar conta</button>
      </form>
      <a href="http://127.0.0.1:5173/login">Já tem uma conta? entre!</a>
    </div>
  );
}

export default Cadastro;