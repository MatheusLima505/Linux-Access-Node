import { useState } from 'react';
import axios from 'axios';
import config from './config';
import styles from './Login.module.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Nome de usuário ou senha nulos.");
      return;
    }

    try {
      const response = await axios.post(`http://${config.serverIP}/login`, {
        username,
        password,
      });

      const user = response.data.user;
      alert("Login bem-sucedido!");

      // Exemplo: guardar userID no localStorage para usar depois
      localStorage.setItem("userID", user.id);
      // Redirecionar, se quiser:
      window.location.href = `http://${config.publicIP}/Home`; // ou onde quiser ir após login

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert(error.response?.data?.message || "Erro ao fazer login.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.container}>
        <h1>Login</h1>
        <input
          placeholder="Nome de usuário"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <a href={`http://${config.publicIP}/cadastro`}>Ainda não tem conta? Cadastre-se</a>
    </div>
  );
}

export default Login;

