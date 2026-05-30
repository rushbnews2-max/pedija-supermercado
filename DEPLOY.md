# Deploy do PediJah

## Railway

Para Railway, use o guia:

[RAILWAY.md](./RAILWAY.md)

## Rodar em producao local

```bash
npm install
npm run build
ADMIN_PASSWORD=sua_senha_forte npm start
```

O sistema sobe na porta `3001`.

## Rodar com Docker

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

Edite a senha:

```env
ADMIN_PASSWORD=sua_senha_forte
```

Suba o sistema:

```bash
docker compose up -d --build
```

Acesse:

```text
http://IP_DO_SERVIDOR:3001
```

## Rodar com dominio e HTTPS

No painel do dominio, aponte um registro `A` para o IP da VPS.

No servidor, crie o `.env`:

```bash
cp .env.example .env
```

Edite:

```env
ADMIN_PASSWORD=sua_senha_forte
DOMAIN=seudominio.com.br
```

Suba com HTTPS automatico:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Acesse:

```text
https://seudominio.com.br
```

## Dados persistentes

Os dados ficam no volume Docker `pedija_data`, montado em `/data`.

Backup via Docker:

```bash
docker cp pedija:/data/database.json ./database-backup.json
```

Restaurar via Docker:

```bash
docker cp ./database-backup.json pedija:/data/database.json
docker restart pedija
```

Backup rodando sem Docker:

```bash
npm run backup
```

Restaurar rodando sem Docker:

```bash
npm run restore -- ./backups/database-ARQUIVO.json
```

## Atualizar sistema na VPS

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Senha administrativa

A senha vem da variavel `ADMIN_PASSWORD` no `.env`.

Depois de trocar a senha:

```bash
docker compose -f docker-compose.prod.yml up -d
```
