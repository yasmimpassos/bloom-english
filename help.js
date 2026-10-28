export function exerciseHelp(question) {
  const text = `${question.prompt} ${question.explanation}`.toLowerCase();
  if (question.help?.trim())
    return { title: 'Entenda o conceito e como aplicar', intro: question.help, steps: [] };
  if (
    /voz passiva|passive voice|na passiva/.test(text) &&
    !/\b(has|have) been\b/i.test(question.answer)
  )
    return {
      title: 'O que é voz passiva?',
      intro:
        'Na voz passiva, o foco está em quem ou no que recebe a ação. O objeto da frase ativa passa a ser o sujeito da passiva.',
      formula: 'Novo sujeito + verbo to be no tempo adequado + particípio (+ by + agente)',
      steps: [
        'Encontre o objeto da frase ativa e coloque-o no início.',
        'Mantenha o tempo verbal usando a forma adequada de to be: is/are no presente, was/were no passado, will be no futuro. No present perfect, use has/have been.',
        'Use o particípio do verbo principal e faça a concordância de to be com o novo sujeito.',
        'Se for relevante dizer quem realizou a ação, acrescente by e o agente no final.',
      ],
      example:
        'They clean the room. → The room is cleaned.\nThey cleaned the room. → The room was cleaned.\nThey have cleaned the room. → The room has been cleaned.',
    };
  if (/voz passiva|passive voice|na passiva/.test(text))
    return {
      title: 'O que é voz passiva?',
      intro:
        'Na voz ativa, o foco é quem faz a ação. Na voz passiva, o foco passa a ser quem ou o que recebe a ação. Por exemplo, em “They have prepared the coffee”, they faz a ação e the coffee recebe a ação de preparar.',
      steps: [
        'Identifique o objeto da frase ativa e coloque-o como sujeito da passiva. No exemplo do café: the coffee.',
        'Mantenha o tempo verbal. “Have prepared” está no present perfect; sua passiva usa has/have + been + particípio passado.',
        'Faça a concordância com o novo sujeito: the coffee é singular, então use has. No plural, como the cups, use have.',
        'Acrescente been e o particípio do verbo principal. Prepare é regular: prepared. Outros verbos podem ser irregulares, como write → written.',
        'Quem fez a ação pode aparecer no final com by: by them. Essa parte é opcional quando o agente não é importante.',
      ],
      formula: 'Novo sujeito + has/have + been + particípio (+ by + agente)',
      example:
        'They have washed the cups. → The cups have been washed.\nThey have prepared the coffee. → The coffee has been prepared.',
    };
  if (question.type === 'reading')
    return {
      title: 'Como encontrar a resposta no texto',
      intro:
        'Reading é compreensão de leitura. Você precisa reconhecer informações explícitas e, em níveis mais altos, tirar conclusões apoiadas no texto.',
      steps: [
        'Leia a pergunta primeiro e identifique o que ela pede: pessoa, lugar, horário, motivo ou conclusão.',
        'Procure no texto o trecho que fala desse assunto. Expressões como today, however e instead podem mudar o sentido.',
        'Compare cada alternativa com o texto inteiro. Uma frase pode parecer possível e ainda assim não ter apoio no texto.',
        'Para uma inferência, escolha o que as informações permitem concluir, sem acrescentar suposições.',
      ],
      example:
        '“She usually drinks coffee. Today she orders tea instead.”\nUsually descreve o hábito; today e instead indicam a mudança. Se a pergunta é sobre hoje, a bebida é tea.',
    };
  if (question.type === 'match' || question.wordId)
    return {
      title: 'Associe significado e contexto',
      intro:
        'Uma palavra ou expressão ganha sentido pelo uso. Em vez de memorizar apenas a tradução, conecte a palavra a uma imagem ou frase curta.',
      steps: [
        'Identifique se a atividade mostra a palavra em inglês ou o significado em português.',
        'Pense no significado principal e descarte opções de outra categoria.',
        'Se for uma expressão, lembre o conjunto completo de palavras.',
        'Diga uma frase de exemplo em voz alta para ajudar a fixar.',
      ],
      example: 'Cup = xícara. Exemplo: “I would like a cup of tea.”',
    };
  if (
    /terceiro condicional|terceiro conditional|third conditional|hipotética no passado/.test(text)
  )
    return {
      title: 'Terceiro condicional: imaginar um passado diferente',
      intro:
        'Usamos o terceiro condicional para uma condição que não aconteceu no passado e seu resultado imaginário. Ele pode expressar arrependimento ou uma hipótese sobre algo já encerrado.',
      formula: 'If + sujeito + had + particípio, sujeito + would have + particípio',
      steps: [
        'Na parte com if, use o past perfect: had + particípio.',
        'Na consequência, use would have + particípio, e não will.',
        'As duas partes se referem a uma situação passada que você está imaginando de outra forma.',
      ],
      example:
        'If I had left earlier, I would have caught the train.\nSe eu tivesse saído antes, teria pegado o trem.',
    };
  if (/primeiro condicional|first conditional/.test(text))
    return {
      title: 'Primeiro condicional: uma possibilidade real',
      intro: 'O primeiro condicional relaciona uma condição possível a uma consequência futura.',
      formula: 'If + presente simples, sujeito + will + verbo base',
      steps: [
        'Depois de if, use o presente simples, mesmo quando estiver falando do futuro.',
        'Na consequência, use will seguido do verbo sem to.',
        'Com he, she e it, mantenha a concordância do presente na parte com if.',
      ],
      example: 'If it rains, I will stay home.\nSe chover, vou ficar em casa.',
    };
  if (/past perfect|___ already|had already/.test(text))
    return {
      title: 'Past perfect: o passado antes de outro passado',
      intro:
        'O past perfect mostra que uma ação já tinha acontecido antes de outro momento passado.',
      formula: 'Sujeito + had + particípio passado',
      steps: [
        'Localize os dois momentos no passado.',
        'Use had + particípio na ação que aconteceu primeiro. Had não muda conforme o sujeito.',
        'Expressões como by the time e already ajudam a reconhecer essa relação.',
      ],
      example:
        'By the time I arrived, the class had already started.\nQuando cheguei, a aula já tinha começado.',
    };
  if (/since|\bfor\b.*duração/.test(text))
    return {
      title: 'For ou since: duração ou ponto inicial?',
      intro: 'For indica por quanto tempo uma situação dura. Since indica quando ela começou.',
      steps: [
        'Se houver uma quantidade de tempo, como two hours ou three years, use for.',
        'Se houver um ponto inicial, como 2020, Monday ou ten o’clock, use since.',
        'As duas palavras aparecem com frequência no present perfect para ligar o passado ao presente.',
      ],
      example: 'I have lived here for two years.\nI have lived here since 2024.',
    };
  if (/some ou any|some \/ any|frases negativas.*incontáveis/.test(text))
    return {
      title: 'Some e any: quantidades não especificadas',
      intro:
        'Some e any podem acompanhar substantivos plurais ou incontáveis. Na regra mais comum, some aparece em afirmações e any em negativas e perguntas.',
      steps: [
        'Veja se a frase é afirmativa, negativa ou interrogativa.',
        'Com isn’t, aren’t, don’t ou doesn’t, geralmente use any.',
        'Some também pode aparecer em ofertas e pedidos em que se espera uma resposta positiva.',
      ],
      example: 'There is some milk. → Há um pouco de leite.\nThere isn’t any milk. → Não há leite.',
    };
  if (/presente simples|presente do verbo to be/.test(text))
    return {
      title: /\b(is|are|am)\b/.test(question.answer)
        ? 'Verbo to be no presente'
        : 'Presente simples e a terceira pessoa',
      intro:
        'O presente simples descreve hábitos, fatos e situações gerais. A forma do verbo depende do sujeito.',
      steps: [
        'Com to be, use I am; he/she/it is; you/we/they are. Um substantivo singular, como the coffee, também usa is.',
        'Com outros verbos, use a forma base com I/you/we/they. Com he/she/it, acrescente -s ou -es.',
        'Em verbos terminados em consoante + y, troque y por -ies: study → studies.',
        'Em perguntas e negativas com does/doesn’t, o verbo principal volta à forma base.',
      ],
      example: 'I drink tea. → He drinks tea.\nThe coffee is hot. → The cups are clean.',
    };
  if (/no passado|yesterday|passado.*encerrado/.test(text))
    return {
      title: 'Simple past: uma ação concluída',
      intro:
        'O passado simples descreve uma ação encerrada, muitas vezes acompanhada de uma data ou de palavras como yesterday e last week.',
      steps: [
        'Localize a indicação de passado.',
        'Verbos regulares geralmente recebem -ed: clean → cleaned.',
        'Verbos irregulares mudam de forma: go → went; send → sent.',
        'Na afirmativa, a forma passada é a mesma para todos os sujeitos. Com did ou didn’t, use o verbo base.',
      ],
      example: 'I visited the museum yesterday.\nDid you visit the museum? → I didn’t visit it.',
    };
  if (/present perfect|experiências sem data|eu nunca/.test(text))
    return {
      title: 'Present perfect: uma ligação com o presente',
      intro:
        'O present perfect pode expressar experiências de vida sem uma data passada definida. Para dizer que nunca teve uma experiência, coloque never entre o auxiliar e o particípio.',
      formula: 'Sujeito + have/has + (never) + particípio',
      steps: [
        'Use have com I/you/we/they e has com he/she/it.',
        'Escolha o particípio: visit → visited; be → been; write → written.',
        'Para “nunca”, use never sem acrescentar not.',
        'Se indicar um momento encerrado, como yesterday, normalmente use simple past.',
      ],
      example: 'I have never visited Canada.\nShe has never been to London.',
    };
  if (/está |estão |estamos |present continuous/.test(text))
    return {
      title: 'Present continuous: uma ação em andamento',
      intro:
        'Para uma ação que está acontecendo agora ou em um período temporário, use o verbo to be seguido do verbo principal com -ing.',
      formula: 'Sujeito + am/is/are + verbo com -ing',
      steps: [
        'Escolha o sujeito e faça a concordância de to be.',
        'Acrescente -ing ao verbo principal: read → reading; work → working.',
        'Em verbos como make, retire o e final: making.',
        'Complete a frase com o objeto ou outras informações.',
      ],
      example: 'She is reading a book.\nThey are working today.',
    };
  if (/\bshould\b|\bcould\b|\bcan\b|\bmust\b/.test(text))
    return {
      title: 'Modal verbs: habilidade, conselho e obrigação',
      intro:
        'Verbos modais acrescentam uma ideia ao verbo principal: can pode expressar capacidade ou permissão; could pode tornar um pedido mais gentil; should dá conselho; must indica obrigação forte.',
      formula: 'Sujeito + modal + verbo base',
      steps: [
        'Escolha o modal conforme a intenção da frase.',
        'Depois de um modal, use o verbo base, sem to e sem -s.',
        'Para perguntar, coloque o modal antes do sujeito.',
      ],
      example:
        'You should rest. → Você deveria descansar.\nCould you help me? → Você poderia me ajudar?',
    };
  if (question.type === 'order')
    return {
      title: 'Como organizar uma frase em inglês',
      intro:
        'Em afirmações simples, a ordem mais comum é sujeito + verbo + complemento. Perguntas e pedidos podem ter uma ordem diferente.',
      steps: [
        'Encontre quem realiza a ação: I, you, he, she ou um substantivo.',
        'Identifique o verbo e os auxiliares ou modais, como is, have, would ou could.',
        'Coloque juntos os grupos que formam uma ideia: a coffee, the museum, next to the park.',
        'Em perguntas, procure a palavra interrogativa e o auxiliar: Where is…? Could you…?',
        'Confira se usou todas as palavras e releia a frase completa.',
      ],
      example: '“I / would / like / a / tea” → I would like a tea.',
    };
  return {
    title: 'Como construir sua resposta',
    intro:
      'Identifique a ideia principal e a estrutura pedida antes de traduzir palavra por palavra.',
    steps: [
      'Encontre o sujeito, o verbo e o complemento.',
      'Observe o tempo verbal, os artigos e as preposições.',
      'Monte a frase e confira a concordância.',
    ],
    example: question.explanation,
  };
}
