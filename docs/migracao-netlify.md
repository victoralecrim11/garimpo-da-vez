# Migração da landing page para Netlify — domínio oficial

## Configuração

1. Entre em https://app.netlify.com/start e escolha **Import an existing project** > **GitHub**.
2. Conceda acesso ao repositorio `victoralecrim11/garimpo-da-vez`.
3. Branch de produção: `main` (configuração de publicação integrada na PR #22).
4. Verifique as configuracoes detectadas de `netlify.toml`: build command `mkdir -p dist && cp index.html dist/ && cp -R assets privacy oauth dist/` e publish directory `dist`.
5. Site oficial informado: https://garimpo-da-vez.netlify.app/ — testar as páginas e o build depois de cada atualização.

Nao precisa React, Node.js, NPM ou compilacao de assets. Apenas os seguintes arquivos entram no deploy:

- `index.html`
- `assets/`
- `privacy/`
- `oauth/`

A pasta `automation/`, a pasta `.github/` e arquivos de configuracao/README **nao** sao publicados. Nunca adicionar arquivos privados ou tokens a essas pastas publicas.

## Checklist antes de substituir a URL no Pinterest

- [ ] Verificar `/`, `/privacy/`, `/oauth/callback/` e arquivos `/assets/` na nova URL (o callback sem parametros deve falhar com seguranca).
- [ ] Verificar responsividade mobile/desktop, menu, links, favicon e tipografia.
- [ ] Atualizar `og:url` em `index.html` com URL canonica definitiva.
- [ ] Atualizar `privacy/index.html` para mencionar Netlify como novo provedor de hospedagem e revisar o tratamento de dados tecnicos de acesso.
- [ ] Na configuracao da aplicacao Mercado Livre, cadastrar o redirect URI HTTPS exato (`https://garimpo-da-vez.netlify.app/oauth/callback/`) e ajustar a configuracao correspondente no aplicativo Python. Nao presumir que a URL antiga continua autorizada.
- [ ] Testar o fluxo OAuth Mercado Livre em seu proprio computador, mantendo o listener local em `127.0.0.1:8765`; o callback so encaminha `code` e `state` para esse listener.
- [ ] Atualizar o link **Site** no Pinterest Business para https://garimpo-da-vez.netlify.app/ e, se aplicavel, as URLs cadastradas no programa de afiliados.
- [ ] Verificar conformidade com as politicas de afiliados do Mercado Livre e Pinterest. Identificar publicidade e links comissionados claramente.
- [ ] Manter o GitHub Pages antigo ate validar que a nova URL funciona; so depois decidir se deseja desativar ou redirecionar.

## Observacoes

- Hospedagem nao gera receita automaticamente: depende do trafego, cliques, compras elegiveis e atribuicao do programa de afiliados.
- O plano Netlify Free aceita sites comerciais e links de afiliados, sujeito aos termos e limites vigentes de creditos.
- Netlify tem deploy automatico para cada push na branch de producao apos conectar o repositorio.
- O conteudo existente usa caminhos relativos, compativeis com hospedagem na raiz do novo dominio.

## Verificacao em 27/10/2026

- Pagina inicial visivel em https://garimpo-da-vez.netlify.app/ na aba do navegador.
- PR #22 de configuracao ja integrada a `main`.
- Atualizacao de `og:url`, privacidade, README e URL de callback Python preparada na PR de finalizacao (nao aplicar o novo callback antes de atualizar o DevCenter).
- Nao foi possivel testar automaticamente as demais rotas e o login OAuth de ponta a ponta. A validacao manual permanece obrigatoria.
