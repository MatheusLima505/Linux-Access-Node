import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet';
import { exec } from 'child_process'
import net from 'net';
import { query } from 'express';

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

//Encontrar porta livre
function findAvailablePort(startPort = 7000, range = 1000) {
  return new Promise((resolve, reject) => {
    let port = startPort;

    function checkPort() {
      const server = net.createServer();

      server.listen(port, () => {
        server.close(() => resolve(port));
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          port++;
          if (port >= startPort + range) {
            reject(new Error("Nenhuma porta disponível"));
          } else {
            checkPort();
          }
        } else {
          reject(err);
        }
      });
    }

    checkPort();
  });
}



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
  const aport = await findAvailablePort(7000, 1000);

  try {
    exec(`docker run -d --name ${containerName} -p ${aport}:7681 ttyd-test`, async (error, stdout, stderr) => {
      if (error) {
        console.error("Erro ao criar container:", error);
        return res.status(500).json({ message: "Erro ao criar container", error: error.message });
      }

      if (stderr) console.warn("Aviso do Docker:", stderr);

      // Salva no banco de dados
      await db.execute("INSERT INTO user_containers (user_id, container_name, container_status, container_port) VALUES (?, ?, ?, ?)",
        [userId, containerName, "running", aport]);

      res.json({ message: "Container criado", containerId: containerName });
    });

  } catch (error) {
    res.status(500).json({ message: "Erro ao criar container", error: error.message });
  }
});

//listar containers de usuario
app.get('/api/listcontainers', async (req, res) => {
  try {
    const userID = req.query.userID;
    if (!userID) {
      return res.status(400).json({ message: "userID é obrigatório" });
    }

    const query = 'SELECT * FROM user_containers WHERE user_id = ?';

    await db.execute(query, [userID], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Erro no banco de dados", error: err });
      }
      res.json(results);
    });

  } catch (error) {
    res.status(500).json({ message: "Erro interno", error: error.message });
  }
});

//remover container
app.delete('/api/rmcontainer', async (req, res) => {
  try {
    const { cont_id, cont_name } = req.query;
    const query = 'delete from user_containers where id = ?'
    await db.execute(query, [cont_id])
    exec(`docker rm -f ${cont_name}`, (error, stdout, stderr) => {
      if (error) {
        console.error("Erro ao remover container:", error);
      }
      res.json({ message: "Container removido com sucesso" });
  });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno', error: error.message })
    console.log(
      'id', req.body.cont_id,
      'name', req.body.cont_name
    )
  }
})


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});