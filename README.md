# LAN - Linux Access Node

O **Linux Access Node** é uma plataforma educacional desenvolvida como Trabalho de Conclusão de Curso (TCC) no IFRN.  
Seu objetivo é oferecer aos estudantes acesso a terminais Linux através de containers Docker, diretamente no navegador, sem necessidade de instalação.  

A proposta é fornecer um ambiente prático para disciplinas como Redes de Computadores e Fundamentos de Linux, permitindo que cada aluno utilize um terminal isolado e persistente para experimentação e aprendizado.


# Funcionalidades Principais

**🌐 Terminais Linux via navegador:** acesso direto a containers Linux usando TTYD.  
**🔐 Autenticação e gerenciamento de usuários:** cada aluno possui sua conta individual.  
**💾 Progresso persistente:** os containers preservam os dados, permitindo que o aluno continue de onde parou.  
**⚡ Multi-containers por usuário:** um mesmo estudante pode gerenciar múltiplos ambientes Linux.  
**🖥️ Cluster de computadores antigos:** o sistema pode ser distribuído em um cluster, aproveitando máquinas de baixo custo.  
**📚 Foco educacional:** ideal para aulas práticas de redes e administração de sistemas.

# 🚀 Instalação

## 1. Instale as dependências necessárias
```bash
# Docker e Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose make curl

# NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

# Node.js (LTS) e npm
nvm install --lts

# Make
sudo apt install make
```
É importante garantir que o seu usuário esteja nos grupos sudo e docker para evitar erros. 

```
# Adicionar ao grupo sudo
sudo usermod -aG sudo $USER

# Adicionar ao grupo docker
sudo usermod -aG docker $USER

# Aplicar as mudanças
newgrp docker
```
## 2. Configure o projeto



No diretório principal do projeto, rode:
```
make install
```

Se o comando falhar, execute manualmente:
```
make node
make npm
```

## 3. Execute o sistema

Para iniciar o projeto:
```
make run
```

Isso vai subir o servidor e o sistema estará acessível via navegador.
# Objetivos do Projeto

- Facilitar o aprendizado prático de Linux sem barreiras de instalação.

- Reaproveitar recursos computacionais já existentes (computadores antigos em cluster).

- Criar um ambiente seguro, isolado e personalizável para cada aluno.

- Provar a viabilidade do uso de containers em ambientes educacionais.
