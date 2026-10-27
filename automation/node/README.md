# Garimpo da Vez — diagnóstico OAuth via Node.js

Este módulo é uma alternativa de diagnóstico ao Python, **sem migrar o restante da automação**. Testa o callback oficial da Netlify e, opcionalmente, realiza um login real PKCE S256. Requer Node.js 20+ e não exige instalar pacotes npm.

## Ambiente permitido

Use apenas em computador pessoal ou ambiente onde a execução de automações pessoais e a autenticação de contas externas sejam autorizadas. Não use Node.js ou Colab para contornar restrições de TI da empresa.

## Verificar apenas a página publicada (sem credenciais)

Execute na raiz do repositório:

    node automation/node/ml-oauth-smoke.mjs --check

Verifica que a página HTTPS da Netlify está acessível e aponta para o listener esperado. **Não confirma permissões, autorização nem acesso à API.**

## Testar OAuth de ponta a ponta

    node automation/node/ml-oauth-smoke.mjs --login-test

1. Informe o Client ID (App ID) e depois o Client Secret na entrada oculta do terminal.
2. O script inicializa um listener apenas em `127.0.0.1:8765`, cria `state` e PKCE S256 e imprime a URL oficial de autorização.
3. Abra a URL no navegador **do mesmo computador** e autorize a aplicação principal.
4. O Mercado Livre retorna a `https://garimpo-da-vez.netlify.app/oauth/callback/`; o HTML da Netlify redireciona `code/state` para a porta local.
5. Node valida `state`, troca o código no endpoint oficial de OAuth e informa sucesso/erro sem exibir tokens.

O callback exato acima deve constar no DevCenter, inclusive a barra final.

**Segurança:** credenciais e tokens não são persistidos, exibidos ou enviados ao repositório. O login de teste de fato recebe tokens, mas os descarta ao final. Portanto não substitui uma sessão OAuth persistente nem implementa refresh token (que é rotativo e de uso único). Não publique logs, screenshots ou links de autorização/callback contendo parâmetros sensíveis.

## Testes offline

    node --test automation/node/ml-oauth-smoke.test.mjs

## Limites e alternativas

- Este módulo não executa `garimpo.py`, não converte o editor gráfico, não gera links de afiliado e não publica Pins.
- Abrir o callback direto no navegador sem parâmetros deve mostrar retorno inválido, o que apenas valida a existência da ponte.
- No Google Colab, o código roda em máquina virtual remota; a ponte atual para `127.0.0.1` do navegador não alcança diretamente o runtime do Colab. Para OAuth remoto real, é necessária arquitetura própria com callback HTTPS no backend e armazenamento seguro de tokens. Não cole segredos em notebooks ou saídas compartilháveis.
- Na migração completa para Node, preservar validações, rotatividade de refresh token, cofre seguro e testes antes de desativar a implementação Python.

Documentação oficial: https://developers.mercadolivre.com.br/autenticacao-e-autorizacao
