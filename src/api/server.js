import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet';
import { exec } from 'child_process'

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
app.use(helmet());

// Limite de requisições:
const limiter = rateLimit({
  windowMs: 60 * 1000, // 15 minutos
  limit: 100 // 100 requisições por IP
})
app.use(limiter);

// Limite de cadastro
const limiterc = rateLimit({
  windowMs: 15 * 60 * 1000, // 5 minutos
  limit: 3 // 3 requisições por IP
})


//Cadastro de usuario
app.post('/cadastro', limiterc, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password são obrigatórios.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.execute(query, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar usuário:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
      } if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Usuário já existe.' });
      }
      return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    })
  } catch (error) {
    console.error('Erro ao criptografar a senha:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});
//Login
app.get('/login', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
})

//Criar container
app.post('/api/createcontainer', async (req, res) => {
  const userId = req.body.userID;
  if (!userId) {
    return res.status(400).json({ message: "ID do usuário não fornecido" });
  }
  // Gera um nome único para o container (ex: user-1-container-123)
  const containerName = `user-${userId}-container-${Date.now()}`;

  try {
    exec(`docker run -d --name ${containerName} -p 7070:7070 ttyd-test`, async (error, stdout, stderr) => {
        if (error) {
            console.error("Erro ao criar container:", error);
            return res.status(500).json({ message: "Erro ao criar container", error: error.message });
        }

        if (stderr) console.warn("Aviso do Docker:", stderr);

        // Salva no banco de dados
        await db.execute("INSERT INTO user_containers (user_id, container_id, container_status) VALUES (?, ?, ?)", 
            [userId, containerName, "running"]);

        res.json({ message: "Container criado", containerId: containerName });
    });

} catch (error) {
    res.status(500).json({ message: "Erro ao criar container", error: error.message });
}
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});