import { useState } from 'react';
import axios from 'axios';
import config from './config'; // importa os IPs
import styles from './Cadastro.module.css'

function Cadastro() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      console.error("Nome de usuário ou senha nulos.");
      alert("Nome de usuário ou senha nulos.");
      return;
    }

    try {
      const response = await axios.post(`http://${config.serverIP}/cadastro`, {
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
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.container}>
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
      <a href={`http://${config.publicIP}/login`}>Já tem uma conta? entre!</a>
    </div>
  );
}

export default Cadastro;


