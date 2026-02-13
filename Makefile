.PHONY: dev build start test lint docker-up docker-down

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

test:
	npm test

lint:
	npm run lint

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down
