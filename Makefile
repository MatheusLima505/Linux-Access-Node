install:
	npm i vite
	npm install
	sudo apt-get update
	sudo apt-get install docker
	cd ./submodule/ttyd-image/regular-docker && /
	sudo docker build -t ttyd-test .

run: 
	npm run dev
	cd ./src/api && /
	node server.js