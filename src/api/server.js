import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const app = express();
const port = 5000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(express.json());
app.use(cors());


//Cadastro de usuario
app.post('/cadastro', async (req,res)=>{
  const {username, password} = req.body;
  if (!username || !password){
    return res.status(400).json({ message: 'Username e password são obrigatórios.' });
  }
  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar usuário:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
      }
      return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  })
} catch (error) {
  console.error('Erro ao criptografar a senha:', error);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}});
//Login
app.get('/login', async (req, res) =>{
  
})






app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});