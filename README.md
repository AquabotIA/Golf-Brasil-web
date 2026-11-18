# Golf Brasil Web

Base de backend para o jogo Golf Brasil usando Firebase Authentication, Firebase Realtime Database e Vercel Functions.

## Estado atual

Este repositório recebeu a estrutura inicial da API. Na inspeção da branch `main`, havia apenas o arquivo `LICENSE`; o HTML/cliente do jogo ainda precisa ser enviado para a raiz ou para a pasta pública antes de publicar a experiência completa.

## Endpoints

- `GET /api/health` — verifica se a função está respondendo.
- `POST /api/scores` — grava uma pontuação após validar o Firebase ID token.
- `GET /api/leaderboard?course=campo-demo&limit=20` — consulta o ranking do campo.

### Enviar pontuação

Enviar `Authorization: Bearer <Firebase ID token>` e JSON:

```json
{
  "course": "campo-demo",
  "holes": 9,
  "strokes": 42
}
```

O UID é extraído do token verificado no servidor, nunca aceito do corpo da requisição. O histórico é gravado em `scores/{course}/{uid}/{scoreId}` e o melhor resultado individual em `leaderboard/{course}/{uid}`.

**Nota antifraude:** o backend autentica o jogador e valida formato/limites, mas ainda não comprova cada tacada realizada no cliente. Para torneios competitivos, será necessária validação adicional da partida e limites de frequência.

## Firebase

Projeto configurado como referência: `golf-brasil`.

1. No Firebase Console, confirme que Authentication com e-mail/senha está habilitado.
2. Confirme que o Realtime Database está criado na região desejada.
3. Em Configurações do projeto > Contas de serviço, gere uma chave privada do Admin SDK.
4. Não envie o JSON da conta de serviço ao GitHub. Não o coloque no HTML.
5. Publique as regras com Firebase CLI:

```bash
firebase login
firebase use golf-brasil
firebase deploy --only database
```

Se a CLI solicitar, associe o projeto com `firebase use --add`.

## Variáveis na Vercel

Cadastre em Project Settings > Environment Variables:

- `FIREBASE_PROJECT_ID` = `golf-brasil`
- `FIREBASE_DATABASE_URL` = URL exata exibida na página do Realtime Database
- `FIREBASE_CLIENT_EMAIL` = campo `client_email` do JSON da conta de serviço
- `FIREBASE_PRIVATE_KEY` = campo `private_key` do JSON da conta de serviço

Use Production, Preview e Development conforme necessário. Após alterar variáveis, faça novo deploy.

## Publicação na Vercel

1. Importe `AquabotIA/Golf-Brasil-web` em https://vercel.com/new.
2. Framework Preset: Other.
3. Root Directory: `./`.
4. Adicione as quatro variáveis de ambiente acima.
5. Faça Deploy.
6. Teste `/api/health`.

O deploy das funções de API não substitui o cliente do jogo: adicione o HTML, CSS, JS e assets do Golf Brasil antes de considerar a publicação completa.

## Segurança

- As regras em `database.rules.json` negam acesso direto por padrão.
- As funções usam Firebase Admin SDK exclusivamente no servidor.
- Nunca comite arquivos de service account, chaves privadas ou arquivos `.env`.
- Configure os domínios autorizados em Firebase Authentication para o domínio Vercel após o primeiro deploy.
