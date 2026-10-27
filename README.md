# Garimpo da Vez — site público

Landing page estática de curadoria de conteúdos e recomendações de produtos, hospedada na Netlify. Marca pública substitui a antiga apresentação de ferramenta interna **AffiliatePilot AI**.

## Site público e estrutura

- Site oficial: https://garimpo-da-vez.netlify.app/
- `index.html`: apresentação, categorias, curadoria e transparência.
- `privacy/index.html`: privacidade aplicável à página estática atual.
- `assets/styles.css`: identidade visual e responsividade.
- `assets/favicon.svg`: símbolo da marca.

Não há checkout, API, n8n, autenticação, catálogo automatizado, pixel próprio nem scripts de rastreamento implementados neste site. Os cartões são **categorias informativas**, não produtos fictícios nem links de compra.

## Atualizar a identidade nas redes

Nome de exibição: **Garimpo da Vez | Achadinhos**. Nome de usuário confirmado pelo responsável: **`@garimpodavez_`**.

Link oficial informado pelo responsável e configurado em `index.html`: https://www.pinterest.com/garimpodavez_/. Se o perfil mudar de arroba, atualizar também o link do botão no site.

## Publicação na Netlify

- Site oficial: https://garimpo-da-vez.netlify.app/
- Repositório: `victoralecrim11/garimpo-da-vez`, branch `main`.
- Configuração versionada: `netlify.toml`; pasta publicada: `dist/`.
- Deploy automático após `git push` na `main`, desde que a conexão GitHub↔Netlify esteja ativa.
- Apenas `index.html`, `assets/`, `privacy/` e `oauth/` entram no deploy; `automation/` permanece fora da área pública.
- Antes de usar o OAuth Mercado Livre, cadastre exatamente `https://garimpo-da-vez.netlify.app/oauth/callback/` no DevCenter; o script Python deve usar a mesma URI.
- Atualize o campo Site do Pinterest Business e os canais cadastrados no programa de afiliados com o endereço oficial.

### Endereço anterior (legado)

`https://victoralecrim11.github.io/garimpo-da-vez/` era o endereço do GitHub Pages. Ele pode permanecer acessível durante a transição, mas não deve ser divulgado como principal; qualquer desativação ou redirecionamento precisa ser feita separadamente. Links externos antigos não são atualizados automaticamente.

## Conteúdo comercial e conformidade

- Publicar links de afiliado somente de produtos elegíveis, gerados pelo painel oficial e dentro das regras vigentes do programa.
- Conferir se este domínio e o canal Pinterest estão cadastrados/permitidos no programa de afiliados do Mercado Livre.
- Identificar claramente o uso de links de afiliado junto às recomendações.
- Não inventar preço, desconto, avaliação, disponibilidade, comissões ou depoimentos.
- Usar imagens de produtos apenas com direitos/autorização adequados. A landing atual usa somente ilustração CSS e SVG próprios.
- Evitar publicações afiliadas repetitivas/em massa; conferir regras do Pinterest.
- Revisar a política de privacidade caso o site comece a coletar dados, hospedar fontes localmente, adicionar analytics ou integrar APIs.

Referências oficiais:
- https://policy.pinterest.com/pt-br/commercial-and-branded-content-guidelines
- https://www.mercadolivre.com.br/l/checklist
- https://www.mercadolivre.com.br/l/afiliados-compartilhamento-de-publicacao

## Validação básica

Conferir desktop/mobile, navegação interna, favicon e política de privacidade, além dos links externos e ortografia. Validar as rotas na Netlify após cada deploy e revisar se o campo Site no perfil do Pinterest está atualizado.