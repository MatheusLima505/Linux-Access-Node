NVM_DIR := $(HOME)/.nvm
install:
	# Atualiza e instala ferramentas essenciais
	sudo apt-get update && sudo apt-get install -y curl git build-essential docker.io

	# Atualiza submódulos git
	git submodule update --init --recursive

	# Configura Docker para desabilitar IPv6
	echo '{ "ipv6": false }' | sudo tee /etc/docker/daemon.json > /dev/null

	# Tenta reiniciar docker, ignora erro se systemctl/service não existirem
	(sudo systemctl restart docker || sudo service docker restart || echo "Não foi possível reiniciar Docker automaticamente.")


	# Se estiver usando WSL, reinicia para aplicar mudanças
	-wsl --shutdown

	# Builda imagem Docker com BuildKit ativado via variável de ambiente
	cd ./submodule/ttyd-image/regular_docker && DOCKER_BUILDKIT=1 sudo docker build -t ttyd-test .

	$(MAKE) node
	$(MAKE) npm

node:
	# Instala o NVM (Node Version Manager)
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

	# Carrega o nvm E instala o Node, tudo em um único shell
	bash -lc '\
		export NVM_DIR="$$HOME/.nvm"; \
		. "$$NVM_DIR/nvm.sh"; \
		nvm install --lts; \
		nvm alias default lts/*; \
		nvm use default; \
		echo "Node version: $$(node -v), NPM version: $$(npm -v)"; \
	'


npm:
	# Reinstala pastas do npm para evitar conflito entre linux e windows
	-rm -rf node_modules package-lock.json
	npm install

run:
	npm run dev -- --host &
	cd ./src/api && node server.js