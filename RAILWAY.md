# Deploy no Railway

## 1. Subir o codigo

Opcao recomendada:

1. Crie um repositorio no GitHub.
2. Envie este projeto para o repositorio.
3. No Railway, clique em **New Project**.
4. Escolha **Deploy from GitHub repo**.
5. Selecione o repositorio do PediJah.

O Railway vai detectar o `Dockerfile` e usar a configuracao do `railway.json`.

## 2. Variaveis obrigatorias

No servico do Railway, abra **Variables** e adicione:

```env
ADMIN_PASSWORD=sua_senha_forte
```

Opcional:

```env
DATA_DIR=/data
```

Se usar Volume do Railway, nao precisa criar `DATA_DIR`; o sistema usa `RAILWAY_VOLUME_MOUNT_PATH` automaticamente.

## 3. Criar Volume para salvar dados

Crie um **Volume** no Railway e conecte ao servico.

Use um Mount Path como:

```text
/data
```

Sem volume, os dados podem sumir quando o servico for recriado.

## 4. Gerar link publico

No servico, abra **Settings** ou **Networking** e gere um dominio Railway.

Vai ficar parecido com:

```text
https://nome-do-projeto.up.railway.app
```

## 5. Dominio proprio

Depois, se quiser usar dominio proprio:

1. Adicione o dominio no Railway.
2. No painel do seu dominio, crie o registro DNS que o Railway pedir.
3. Aguarde propagacao.

## 6. Login

O painel administrativo usa a senha definida em:

```env
ADMIN_PASSWORD
```

O catalogo continua publico.
