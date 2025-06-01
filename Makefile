install:
	# Atualiza e instala ferramentas essenciais + nodejs e npm
	sudo apt-get update && sudo apt-get install -y curl git build-essential docker.io gnome-terminal nodejs npm

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