install:
	# Atualiza e instala ferramentas essenciais
	sudo apt-get update && sudo apt-get install -y curl git build-essential docker.io gnome-terminal

	# Instala NVM se não existir
	if [ ! -d "$$HOME/.nvm" ]; then \
		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash; \
	fi

	# Carrega NVM e instala Node.js 22
	export NVM_DIR="$$HOME/.nvm" && \
	. "$$NVM_DIR/nvm.sh" && \
	nvm install 22 && \
	nvm use 22

	# Instala dependências npm
	npm i vite
	npm install

	# Atualiza submódulos git
	git submodule update --init --recursive

	# Configura Docker para desabilitar IPv6
	echo '{ "ipv6": false }' | sudo tee /etc/docker/daemon.json > /dev/null
	sudo service docker restart

	# Builda imagem Docker
	cd ./submodule/ttyd-image && sudo docker build -t ttyd-test .

run:
	npm run dev &
	cd ./src/api && node server.js
