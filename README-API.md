# SoloObra API 

## ROTAS - USAR http://localhost:5000.

- `POST /login`
- `POST /api/usuarios`
- `GET /api/usuarios/me`
- `GET /api/usuarios/:id`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`
- `GET /api/maquinas`
- `GET /api/maquinas/:id`
- `GET /api/maquinas/minhas`
- `POST /api/maquinas`
- `PUT /api/maquinas/:id`
- `DELETE /api/maquinas/:id`

## Arquivos incluídos na entrega
- `backend/` - código fonte da API Express/Sequelize
- `backend/Dockerfile` - imagem Docker da API
- `docker-compose.yml` - orquestra API + banco PostgreSQL
- `.env.docker` - variáveis de ambiente para Docker
- `README-API.md` - instruções de execução 
- `Aula Copy.postman_collection.json` - coleção para Insomnia/Postman

## Requisitos
- Docker instalado
- Docker Compose instalado

## Como executar
1. Abra um terminal na pasta raiz do repositório.
2. Execute:

```bash
docker compose up --build
```

3. Aguarde os containers serem criados.
4. A API ficará disponível em:

```text
http://localhost:5000
```

## Teste rápido
- `GET http://localhost:5000/` → health check
- `POST http://localhost:5000/login` → autenticação
- `POST http://localhost:5000/api/usuarios` → cadastro de usuário

## Observações
- O banco PostgreSQL estará exposto na porta `5433` do host.
- O serviço `api` se conecta ao banco pelo hostname `db` dentro da rede Docker.
- O JWT usado no container é `soloobra-docker-secret`.

## Importar coleção de endpoints
Importe o arquivo `Aula Copy.postman_collection.json` no Postman ou Insomnia.
