import { useState } from 'react';
import './styles/login.css';
import axios from 'axios';

function Login() {
    return(
        <div className='container'>
        <h1>Login</h1>
        <input placeholder= 'Nome'type="text" name='nome' />
        <input type="password" name="senha" id="" placeholder='Senha' />
        <button type='submit'>Entrar</button>
        </div>
    );
}
export default Login