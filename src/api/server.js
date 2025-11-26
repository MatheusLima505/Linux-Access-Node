import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet';
import { exec } from 'child_process'
import net from 'net';
import { query } from 'express';
import { createClient } from '@supabase/supabase-js';


//supabase
const supabaseUrl = 'https://qkehqytciiacvmehslco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrZWhxeXRjaWlhY3ZtZWhzbGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzA0NjUsImV4cCI6MjA2MjE0NjQ2NX0.64fQGwbOZ_1P5uVyWflLdKD9VXKikrSl4juiLariFwA';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = 5000;

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

// Cadastro de usuario
app.post('/cadastro', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password são obrigatórios.' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST100') {
      console.error('Erro ao verificar usuário existente:', fetchError);
      return res.status(500).json({ message: 'Erro ao verificar usuário.' });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe.' });
    }

    // Insert the new user into the database
    const { data, error } = await supabase
      .from('users')
      .insert([
        { username, password: hashedPassword }
      ]);

    if (error) {
      console.error('Erro ao cadastrar usuário:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
    }

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

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
    // Cria o container usando o Docker
    exec(`docker run -d --restart=always --name ${containerName} -p ${aport}:7681 ttyd-test bash -c "ttyd -W bash & while true; do sleep 9999; done"`
      , async (error, stdout, stderr) => {
      if (error) {
        console.error("Erro ao criar container:", error);
        return res.status(500).json({ message: "Erro ao criar container", error: error.message });
      }

      if (stderr) console.warn("Aviso do Docker:", stderr);

      // Salva no banco de dados (Supabase)
      const { data, error: insertError } = await supabase
        .from('user_containers')
        .insert([
          { user_id: userId, container_name: containerName, container_status: 'running', container_port: aport }
        ]);

      if (insertError) {
        console.error("Erro ao salvar no banco de dados:", insertError);
        return res.status(500).json({ message: "Erro ao salvar container no banco de dados", error: insertError.message });
      }

      // Resposta de sucesso
      res.json({ message: "Container criado", containerId: containerName });
    });

  } catch (error) {
    console.error("Erro ao criar o container:", error);
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

    // Query to fetch containers for the given userID
    const { data, error } = await supabase
      .from('user_containers')
      .select('*')
      .eq('user_id', userID);

    if (error) {
      console.error("Erro ao buscar containers:", error);
      return res.status(500).json({ message: "Erro ao buscar containers", error: error.message });
    }

    // Return the data if the query is successful
    res.json(data);
    
  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ message: "Erro interno", error: error.message });
  }
});


//remover container

app.delete('/api/rmcontainer', async (req, res) => {
  try {
    const { cont_id, cont_name } = req.query;
    
    if (!cont_id || !cont_name) {
      return res.status(400).json({ message: "ID e nome do container são obrigatórios" });
    }

    // Remove container record from Supabase
    const { data, error: deleteError } = await supabase
      .from('user_containers')
      .delete()
      .eq('id', cont_id);

    if (deleteError) {
      console.error("Erro ao remover container do banco de dados:", deleteError);
      return res.status(500).json({ message: "Erro ao remover container do banco de dados", error: deleteError.message });
    }

    // Remove Docker container using Docker CLI
    exec(`docker rm -f ${cont_name}`, (error, stdout, stderr) => {
      if (error) {
        console.error("Erro ao remover container Docker:", error);
        return res.status(500).json({ message: "Erro ao remover container Docker", error: error.message });
      }

      if (stderr) {
        console.warn("Aviso do Docker:", stderr);
      }

      // Send success response
      res.json({ message: "Container removido com sucesso" });
    });

  } catch (error) {
    console.error("Erro interno:", error);
    res.status(500).json({ message: 'Erro interno', error: error.message });
  }
});
//renomear container 
app.post('/api/renamecontainer', async (req, res) => {
  try {
    const cont_id = req.body.cont_id;
    const cont_name = req.body.cont_name;

    const { data, error: renameError } = await supabase
      .from('user_containers')
      .update({ container_name: cont_name })
      .eq('id', cont_id);

    if (renameError) {
      return res.status(500).json({ error: renameError.message });
    }

    return res.status(200).json({ message: 'Container renomeado com sucesso.', data });
  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Login
app.post('/login', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password são obrigatórios.' });
  }

  try {
    // Busca o usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({ message: "Erro ao buscar usuário" });
    }

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // Compara senhas
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // Retorna sucesso com ID e username (ou o que desejar)
    return res.status(200).json({ 
      message: "Login bem-sucedido", 
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ message: "Erro interno", error: err.message });
  }
});

//valida usuario
app.get('/validate-user/:id', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const userID = req.params.id;

  if (!userID) {
    return res.status(400).json({ message: "ID não fornecido" });
  }

  try {
    // buscamos apenas o ID para ser rápido
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userID)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Erro ao validar usuário" });
    }

    if (!user) {
      return res.status(404).json({ message: "Usuário não existe" });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Erro interno:", err);
    return res.status(500).json({ message: "Erro interno" });
  }
});
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});