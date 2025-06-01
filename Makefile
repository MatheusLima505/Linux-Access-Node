install:
	# Atualiza e instala ferramentas essenciais
	sudo apt-get update && sudo apt-get install -y curl git build-essential docker.io gnome-terminal

	# Instala NVM se não existir
	if [ ! -d "$$HOME/.nvm" ]; then \
		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash; \
	fi

	bash -c '\
		export NVM_DIR="$$HOME/.nvm"; \
		[ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh"; \
		nvm install node; \
		nvm use node; \
		npm install; \
	'

	# Atualiza submódulos git
	git submodule update --init --recursive

	# Configura Docker para desabilitar IPv6 (sem 'features' que dá erro)
	echo '{ "ipv6": false }' | sudo tee /etc/docker/daemon.json > /dev/null

	# Reinicia Docker (use service ou systemctl conforme seu sistema)
	sudo systemctl restart docker || sudo service docker restart

	# Se estiver usando WSL, reinicia para aplicar mudanças
	-wsl --shutdown

	# Builda imagem Docker com BuildKit ativado via variável de ambiente
	cd ./submodule/ttyd-image/regular_docker && DOCKER_BUILDKIT=1 sudo docker build -t ttyd-test .


run:
	npm run dev &
	cd ./src/api && node server.js
