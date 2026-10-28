# Bloom — Inglês do seu jeito

Uma plataforma pessoal de estudo de inglês, em português, com ilustrações vetoriais, interface responsiva e atividades que funcionam mesmo sem chave de API.

## Executar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra **http://localhost:5173**. A variável `PORT` permite escolher outra porta. O servidor de desenvolvimento não precisa de dependências de produção.

## O que está incluído

- **Visão geral:** meta diária, XP, sequência de estudo, prática rápida e palavra para salvar.
- **Trilhas:** seis temas (cafeteria, viagens, rotina, modal verbs, trabalho e cidade), quatro níveis de A1 a B2 e 144 atividades. Todos os níveis estão disponíveis; seis trilhas com pelo menos 80% de acertos sugerem o próximo nível automaticamente. A melhor nota fica preservada.
- **Exercícios:** leitura, gramática de múltipla escolha, lacunas, ordenação de palavras, escrita com respostas e variantes predefinidas e associação de palavras a traduções.
- **Materiais:** adição de tema livre ou texto, importação de TXT/Markdown de até 200 KB e 30 mil caracteres, biblioteca e geração de 6, 12 ou 18 exercícios com tipos selecionáveis.
- **Ajuda nos exercícios:** “Tenho uma dúvida” abre uma explicação do conceito, estrutura e exemplos na própria tela. Funciona sem chave de API; exercícios personalizados novos também podem trazer explicações próprias. Consultar agenda o exercício para revisão em 24 horas, mesmo quando a resposta é correta. Fechar a explicação não cancela o agendamento.
- **Revisão:** erros e dúvidas com explicação, data e contagem de tentativas. Pedir ajuda não conta como erro. Acertos com ajuda não consolidam o item; três revisões corretas sem ajuda o consolidam. Após acertos sem ajuda, agenda revisão para um dia e depois sete dias. Também é possível revisar antes do prazo.
- **Vocabulário:** palavras, expressões, tradução, exemplo, busca, pronúncia, flashcards e prática escrita.
- **Progresso:** histórico, gráficos, acurácia, trilhas por nível e retomada de uma sessão interrompida.
- **Configurações:** perfil, nível, meta, chave de API, provedor de IA, modelo e importação/exportação de backup.

O progresso usa `localStorage` e fica **neste navegador e dispositivo**. Não há conta de usuário nem sincronização em nuvem. Exporte um backup antes de limpar os dados do navegador. A pronúncia usa o recurso de síntese de voz do navegador e depende das vozes disponíveis no dispositivo.

## Gerar exercícios com IA

Em **Configurações → Inteligência artificial**, escolha um provedor, crie uma chave pelo link da própria tela, cole e salve. Não é necessário ter uma chave ou assinatura do ChatGPT para usar as alternativas.

| Provedor      | Modelo sugerido         | Acesso e condições                                                                                                                         |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Groq (padrão) | `openai/gpt-oss-20b`    | Cota no plano Free; usa um modelo aberto executado pela Groq e uma chave Groq, sem chave OpenAI. Limites variam por conta e modelo.        |
| Google Gemini | `gemini-2.5-flash-lite` | Faixa gratuita para contas/projetos elegíveis. Disponível no Brasil. O Google pode usar conteúdo do nível gratuito para melhorar produtos. |
| OpenRouter    | `openrouter/free`       | Roteador de modelos gratuitos. Sem compra de créditos: 50 requisições/dia e até 20/minuto; disponibilidade pode variar.                    |
| OpenAI        | `gpt-4.1-mini`          | API paga, mantida como opção. Requer chave e saldo/acesso apropriados.                                                                     |

Condições pesquisadas em **28/10/2026** nas fontes oficiais: [Groq — limites](https://console.groq.com/docs/rate-limits), [Groq — criar chave](https://console.groq.com/keys), [Gemini — preços](https://ai.google.dev/gemini-api/docs/pricing), [Gemini — elegibilidade](https://ai.google.dev/gemini-api/docs/troubleshooting), [Gemini — criar chave](https://aistudio.google.com/apikey), [OpenRouter — modelos grátis](https://openrouter.ai/collections/free-models), [OpenRouter — criar chave](https://openrouter.ai/settings/keys), [OpenAI — preços](https://developers.openai.com/api/docs/pricing). As condições podem mudar; o painel do provedor mostra a cota real da conta.

**Testar conexão** verifica a chave e, quando possível, o modelo, sem gerar exercícios. Não garante saldo, elegibilidade para gratuidade ou disponibilidade futura. O OpenRouter verifica a chave; a disponibilidade do modelo só é confirmada na geração. A opção de modelo pago é bloqueada no adaptador OpenRouter: somente `openrouter/free` e IDs terminados em `:free`, com teto de preço de entrada e saída igual a zero. Não há troca automática entre provedores, compra de créditos ou ativação de faturamento.

Groq e Gemini também oferecem planos pagos. O site não consegue determinar o plano de faturamento da sua conta. Para uso gratuito, mantenha uma conta/plano elegível e consulte o painel do provedor. Se o Google não liberar a cota grátis, experimente outra opção; não é preciso ativar faturamento para usar outro provedor.

Em **Meus materiais**, adicione um texto ou tema, escolha nível, quantidade e formatos e clique em **Salvar e gerar exercícios**. O material é salvo antes da chamada, inclusive se houver falha ou limite de uso. A trilha gerada fica disponível em **Minhas trilhas**. Em cotas pequenas, comece com 6 exercícios e um texto curto.

Cada provedor mantém sua chave e modelo separados em `sessionStorage`. As chaves são enviadas apenas ao serviço selecionado, por HTTPS, nunca entram no progresso, no backup ou nos arquivos do projeto e são encerradas com a sessão. Configurações OpenAI de sessões anteriores são migradas automaticamente. O texto do material é enviado ao provedor selecionado quando você solicita uma geração.

Os adaptadores usam a [Responses API da OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs) com `store: false`, [JSON Schema da Groq](https://console.groq.com/docs/structured-outputs), [generateContent do Gemini](https://ai.google.dev/api/generate-content) com saída JSON ou chat completions do OpenRouter. A estrutura de cada exercício é validada antes de salvar. Modelos Groq personalizados que não estão na lista de suporte estrito usam JSON Object Mode e validação local.

Esta implementação atende ao uso pessoal com chave própria. Uma versão compartilhada com chave central deverá usar um backend autenticado, limites de uso e armazenamento de segredos no servidor. Não coloque uma chave no código ou em um build estático.

A geração e os testes de conexão foram verificados com respostas simuladas dos quatro provedores; não foram consumidas chaves reais durante o desenvolvimento. As respostas de escrita são verificadas por texto e variantes aceitas, com tolerância a maiúsculas e pontuação. Não há avaliação semântica de redações abertas. Questões geradas por IA devem ser revisadas quanto à qualidade pedagógica.

## Verificar

```bash
npm test
npm run test:e2e
npm run build
```

Os testes de navegador precisam do site em execução em `http://127.0.0.1:5173`. Por padrão utilizam o Google Chrome em `/usr/bin/google-chrome`; ajuste `playwright.config.js` se o executável estiver em outro local. Cobrem navegação em desktop e celular, os seis formatos de exercício, retomada, revisão, vocabulário, configurações, backups e integração simulada com a API. Os testes unitários cobrem conteúdo, correção, revisão espaçada, sequência e validação.

## Publicar

`npm run build` cria a pasta `dist/`, que pode ser publicada em qualquer hospedagem estática por HTTPS. Não há roteamento de servidor: as páginas usam fragmentos de URL (`#learn`, `#vocab` etc.). Nenhuma chave entra no build. As fontes usam Google Fonts; há fontes locais de fallback.

A publicação pelo conector Sites não foi possível neste ambiente: o serviço retornou que Sites ainda não está habilitado neste espaço. Nenhum site foi criado por esse conector. A publicação deste projeto usa GitHub Pages.

### GitHub Pages

Endereço previsto após a primeira publicação: **https://yasmimpassos.github.io/bloom-english/**.

O workflow [.github/workflows/pages.yml](.github/workflows/pages.yml) instala as dependências, executa os testes unitários, gera `dist/` e publica o artefato no Pages a cada push em `main`. Não utiliza chave de IA ou outro segredo de API no GitHub. O build funciona em uma subpasta de repositório, como `/bloom-english/`.

1. Crie o repositório público `bloom-english` na conta `yasmimpassos`, sem inicializar README ou histórico remoto.
2. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions** como Source.
3. Envie a branch `main`. Acompanhe **Actions → Publicar Bloom no GitHub Pages** até concluir.
4. Abra o endereço que o workflow mostrar no ambiente `github-pages`.

Nesta máquina, a conta secundária usa a função **`guser2`** em `~/.bash_aliases` e o host SSH **`github-conta2`**. A configuração local corresponde a `Yasmim Passos` e ao e-mail pessoal configurado nessa função. Para futuros projetos:

```bash
source ~/.bash_aliases
guser2
gwho
```

O remote deste projeto deve usar `git@github-conta2:yasmimpassos/bloom-english.git`. O SSH permite enviar commits; para criar repositórios ou ativar o Pages via CLI, também é necessário login da conta secundária no `gh`.

O site publicado terá uma origem diferente de `localhost`. Para levar o progresso já existente, exporte um backup no site local e importe-o na versão publicada. A chave de API deverá ser informada novamente.

## Organização

- `app.js`: interface, navegação, exercícios, biblioteca, IA e persistência.
- `content.js`: temas e atividades por nível.
- `learning.js`: normalização, correção, revisão, datas e validação.
- `help.js`: explicações dos conceitos e estratégias de resolução.
- `providers.js`: provedores, contratos de API, validação de conexão, proteção de modelos gratuitos e tratamento de respostas.
- `styles.css`: identidade visual e layouts responsivos.
- `server.mjs`: servidor estático local.
- `build.mjs`: empacotamento dos arquivos estáticos.
- `tests/`: testes unitários e de navegador.

Os SVGs são desenhados no próprio projeto e não dependem de imagens externas.
