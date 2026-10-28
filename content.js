export const levels = {
  A1: 'Primeiros passos',
  A2: 'Básico',
  B1: 'Intermediário',
  B2: 'Intermediário avançado',
};
export const topics = [
  {
    id: 'coffee',
    title: 'Na cafeteria',
    sub: 'Um café e uma boa conversa.',
    icon: 'coffee',
    color: 'peach',
    tag: 'DIA A DIA',
    word: 'cup',
    translation: 'xícara',
    distractors: ['colher', 'prato', 'mesa'],
    sentence: 'I would like a coffee please',
    pt: 'Eu gostaria de um café, por favor.',
    passage:
      'Emma visits a small café every morning. She usually orders a cappuccino and a cheese sandwich. Today she wants to try something different, so she orders tea instead. She sits by the window and reads a book before work.',
    read: 'O que Emma pede para beber hoje?',
    options: ['Tea', 'A cappuccino', 'Orange juice', 'Water'],
    readAnswer: 'Tea',
    explain: 'O texto diz que hoje ela pede chá (tea) em vez do cappuccino habitual.',
  },
  {
    id: 'travel',
    title: 'Mundo afora',
    sub: 'Seu inglês vai viajar com você.',
    icon: 'plane',
    color: 'blue',
    tag: 'VIAGENS',
    word: 'boarding pass',
    translation: 'cartão de embarque',
    distractors: ['passaporte', 'mala', 'bilhete de ônibus'],
    sentence: 'Where is the nearest train station',
    pt: 'Onde fica a estação de trem mais próxima?',
    passage:
      'Lucas is visiting London for the first time. His flight arrives at nine in the morning. He takes a train from the airport because it is faster than the bus. His hotel is near the station, so he walks there with his suitcase.',
    read: 'Por que Lucas escolhe o trem?',
    options: [
      'It is faster than the bus',
      'It is free',
      'His hotel is at the airport',
      'He has no suitcase',
    ],
    readAnswer: 'It is faster than the bus',
    explain: 'Ele escolhe o trem porque é mais rápido do que o ônibus: faster than the bus.',
  },
  {
    id: 'daily',
    title: 'Minha rotina',
    sub: 'Transforme o cotidiano em prática.',
    icon: 'sun',
    color: 'yellow',
    tag: 'DIA A DIA',
    word: 'breakfast',
    translation: 'café da manhã',
    distractors: ['almoço', 'jantar', 'lanche'],
    sentence: 'I usually wake up at seven',
    pt: 'Eu geralmente acordo às sete.',
    passage:
      'Mia works from home on Mondays and Wednesdays. On other weekdays, she cycles to the office. She starts work at eight and has lunch at twelve. After work, she often cooks dinner with her sister.',
    read: 'Como Mia vai ao escritório?',
    options: ['By bicycle', 'By car', 'By train', 'On foot'],
    readAnswer: 'By bicycle',
    explain:
      'Cycles significa ir de bicicleta. Ela trabalha em casa em dois dias e pedala nos outros.',
  },
  {
    id: 'modals',
    title: 'Modal verbs',
    sub: 'Can, could, should… você consegue!',
    icon: 'puzzle',
    color: 'purple',
    tag: 'GRAMÁTICA',
    word: 'should',
    translation: 'deveria',
    distractors: ['sempre', 'ontem', 'talvez'],
    sentence: 'You should drink more water',
    pt: 'Você deveria beber mais água.',
    passage:
      'The library is a quiet place. Visitors must keep their phones on silent. They can borrow up to five books, but they must return them within two weeks. If they need more time, they should ask a librarian for help.',
    read: 'Qual é uma obrigação na biblioteca?',
    options: ['Keep phones on silent', 'Borrow five books', 'Buy a book', 'Ask for help every day'],
    readAnswer: 'Keep phones on silent',
    explain: 'Must indica obrigação. Os visitantes devem manter os celulares no silencioso.',
  },
  {
    id: 'work',
    title: 'Inglês no trabalho',
    sub: 'Mais confiança em cada reunião.',
    icon: 'briefcase',
    color: 'pink',
    tag: 'CARREIRA',
    word: 'deadline',
    translation: 'prazo final',
    distractors: ['salário', 'férias', 'entrevista'],
    sentence: 'Could you send me the report',
    pt: 'Você poderia me enviar o relatório?',
    passage:
      'Anna is preparing a presentation for Friday. She needs the sales report by Thursday afternoon. Her colleague James offers to help with the charts. They arrange a short meeting on Wednesday to review their progress.',
    read: 'Quando Anna precisa do relatório?',
    options: ['By Thursday afternoon', 'On Friday evening', 'On Monday', 'After the presentation'],
    readAnswer: 'By Thursday afternoon',
    explain:
      'By Thursday afternoon significa até quinta-feira à tarde, antes da apresentação de sexta.',
  },
  {
    id: 'city',
    title: 'Pela cidade',
    sub: 'Descubra lugares e novas palavras.',
    icon: 'map',
    color: 'mint',
    tag: 'EXPLORAR',
    word: 'crosswalk',
    translation: 'faixa de pedestres',
    distractors: ['semáforo', 'calçada', 'estacionamento'],
    sentence: 'The museum is next to the park',
    pt: 'O museu fica ao lado do parque.',
    passage:
      'There is a new museum next to Central Park. It opens at ten and closes at six, except on Fridays, when it stays open until eight. Entry is free for children under twelve. Adults pay ten pounds.',
    read: 'Até que horas o museu abre na sexta-feira?',
    options: ['Eight in the evening', 'Six in the evening', 'Ten in the morning', 'Twelve at noon'],
    readAnswer: 'Eight in the evening',
    explain: 'A exceção é sexta-feira, quando o museu fica aberto até as oito da noite.',
  },
];
const contexts = {
  coffee: {
    subject: 'The coffee',
    description: 'hot',
    verb: 'drinks',
    base: 'drink',
    object: 'coffee',
    past: 'ordered',
    pastBase: 'order',
    pastRest: 'a tea',
    noun: 'milk',
    condition: 'the café is open',
    future: 'I will buy a coffee',
    pastCondition: 'the café had been open',
    pastFuture: 'I would have bought a coffee',
    pastEvent: 'the event at the café',
    ptA1: 'Eu quero um chá.',
    enA1: 'I want a tea',
    ptA2: 'Ela está preparando café.',
    enA2: 'She is making coffee',
    ptB1: 'Eu nunca experimentei este café.',
    enB1: 'I have never tried this coffee',
    active: 'They have prepared the coffee.',
    passive: 'The coffee has been prepared',
  },
  travel: {
    subject: 'The airport',
    description: 'busy',
    verb: 'takes',
    base: 'take',
    object: 'the train',
    past: 'visited',
    pastBase: 'visit',
    pastRest: 'London',
    noun: 'luggage',
    condition: 'the flight is late',
    future: 'I will call the hotel',
    pastCondition: 'I had booked earlier',
    pastFuture: 'I would have paid less',
    pastEvent: 'the flight',
    ptA1: 'Eu tenho um passaporte.',
    enA1: 'I have a passport',
    ptA2: 'Ele está esperando o ônibus.',
    enA2: 'He is waiting for the bus',
    ptB1: 'Eu nunca estive em Londres.',
    enB1: 'I have never been to London',
    active: 'They have cancelled the flight.',
    passive: 'The flight has been cancelled',
  },
  daily: {
    subject: 'My room',
    description: 'clean',
    verb: 'wakes',
    base: 'wake',
    object: 'up at seven',
    past: 'cleaned',
    pastBase: 'clean',
    pastRest: 'my room',
    noun: 'bread',
    condition: 'I finish work early',
    future: 'I will cook dinner',
    pastCondition: 'I had woken up earlier',
    pastFuture: 'I would have caught the bus',
    pastEvent: 'the lesson',
    ptA1: 'Eu leio todos os dias.',
    enA1: 'I read every day',
    ptA2: 'Ela está lendo um livro.',
    enA2: 'She is reading a book',
    ptB1: 'Eu nunca trabalhei aos domingos.',
    enB1: 'I have never worked on Sundays',
    active: 'They have cleaned the house.',
    passive: 'The house has been cleaned',
  },
  modals: {
    subject: 'This exercise',
    description: 'easy',
    verb: 'studies',
    base: 'study',
    object: 'English every day',
    past: 'finished',
    pastBase: 'finish',
    pastRest: 'the exercise',
    noun: 'time',
    condition: 'you practise every day',
    future: 'you will improve',
    pastCondition: 'you had asked for help',
    pastFuture: 'I would have helped you',
    pastEvent: 'the class',
    ptA1: 'Eu posso ajudar você.',
    enA1: 'I can help you',
    ptA2: 'Você deveria descansar.',
    enA2: 'You should rest',
    ptB1: 'Eu nunca tive que fazer isso.',
    enB1: 'I have never had to do this',
    active: 'They have changed the rules.',
    passive: 'The rules have been changed',
  },
  work: {
    subject: 'The meeting',
    description: 'important',
    verb: 'writes',
    base: 'write',
    object: 'reports',
    past: 'sent',
    pastBase: 'send',
    pastRest: 'the report',
    noun: 'information',
    condition: 'the client agrees',
    future: 'we will start the project',
    pastCondition: 'we had met the deadline',
    pastFuture: 'we would have won the contract',
    pastEvent: 'the meeting',
    ptA1: 'Eu trabalho aqui.',
    enA1: 'I work here',
    ptA2: 'Eles estão trabalhando hoje.',
    enA2: 'They are working today',
    ptB1: 'Eu nunca participei de uma reunião online.',
    enB1: 'I have never attended an online meeting',
    active: 'They have completed the project.',
    passive: 'The project has been completed',
  },
  city: {
    subject: 'The museum',
    description: 'open',
    verb: 'walks',
    base: 'walk',
    object: 'to the park',
    past: 'walked',
    pastBase: 'walk',
    pastRest: 'to the museum',
    noun: 'traffic',
    condition: 'the museum is open',
    future: 'we will visit it',
    pastCondition: 'we had left earlier',
    pastFuture: 'we would have avoided the traffic',
    pastEvent: 'the tour',
    ptA1: 'O parque é grande.',
    enA1: 'The park is big',
    ptA2: 'Nós estamos visitando o museu.',
    enA2: 'We are visiting the museum',
    ptB1: 'Eu nunca visitei este museu.',
    enB1: 'I have never visited this museum',
    active: 'They have repaired the bridge.',
    passive: 'The bridge has been repaired',
  },
};
function grammarFor(id, level) {
  const c = contexts[id] || contexts.coffee;
  const duration =
    {
      coffee: 'waiting at the café',
      travel: 'waiting at the airport',
      daily: 'working at home',
      modals: 'studying English',
      work: 'working on this report',
      city: 'exploring the city',
    }[id] || 'studying English';
  if (level === 'A1')
    return [
      {
        type: 'choice',
        prompt: 'Escolha a frase correta.',
        answer: `${c.subject} is ${c.description}.`,
        options: ['is', 'are', 'am', 'be'].map((v) => `${c.subject} ${v} ${c.description}.`),
        explanation:
          'O sujeito está no singular. No presente do verbo to be, usamos is com he, she, it e substantivos no singular.',
      },
      {
        type: 'fill',
        prompt: `Complete usando o presente simples de ${c.base}: “He ___ ${c.object}.”`,
        answer: c.verb,
        explanation: `No presente simples, a terceira pessoa do singular exige -s ou -es, com ajustes de escrita: ${c.base} → ${c.verb}.`,
      },
      {
        type: 'write',
        prompt: `Escreva em inglês: “${c.ptA1}”`,
        answer: c.enA1,
        explanation: `Uma forma correta é: ${c.enA1}.`,
      },
    ];
  if (level === 'A2')
    return [
      {
        type: 'choice',
        prompt: 'Escolha a frase correta no passado.',
        answer: `I ${c.past} ${c.pastRest} yesterday.`,
        options: [c.past, c.pastBase, `am ${c.pastBase}`, `have ${c.pastBase}`].map(
          (v) => `I ${v} ${c.pastRest} yesterday.`,
        ),
        explanation: `Yesterday indica um período encerrado. O passado de ${c.pastBase} é ${c.past}.`,
      },
      {
        type: 'fill',
        prompt: `Complete com some ou any: “There isn’t ___ ${c.noun}.”`,
        answer: 'any',
        explanation:
          'Usamos any em frases negativas com substantivos incontáveis, como neste exemplo.',
      },
      {
        type: 'write',
        prompt: `Escreva em inglês: “${c.ptA2}”`,
        answer: c.enA2,
        accepted: [
          c.enA2
            .replace('She is', "She's")
            .replace('He is', "He's")
            .replace('They are', "They're")
            .replace('We are', "We're"),
        ],
        explanation: `Uma forma correta é: ${c.enA2}.`,
      },
    ];
  if (level === 'B1')
    return [
      {
        type: 'choice',
        prompt: 'Escolha o primeiro condicional correto.',
        answer: `If ${c.condition}, ${c.future}.`,
        options: [
          `If ${c.condition}, ${c.future}.`,
          `If ${c.condition}, ${c.future.replace('will', 'would have')}.`,
          `If ${c.condition}, ${c.future.replace('will', 'was')}.`,
          `If ${c.condition}, ${c.future.replace('will', 'have')}.`,
        ],
        explanation:
          'O primeiro condicional usa if + presente simples e will + verbo base para uma consequência futura possível.',
      },
      {
        type: 'fill',
        prompt: `Complete com since ou for: “I have been ${duration} ___ two hours.”`,
        answer: 'for',
        explanation:
          'Usamos for com duração (two hours). Since é usado com o ponto inicial (since ten o’clock).',
      },
      {
        type: 'write',
        prompt: `Escreva em inglês: “${c.ptB1}”`,
        answer: c.enB1,
        accepted: [c.enB1.replace('I have', "I've")],
        explanation: `Experiências sem data definida podem usar present perfect: ${c.enB1}.`,
      },
    ];
  return [
    {
      type: 'choice',
      prompt: 'Qual frase expressa uma situação hipotética no passado?',
      answer: `If ${c.pastCondition}, ${c.pastFuture}.`,
      options: [
        `If ${c.pastCondition}, ${c.pastFuture}.`,
        `If ${c.pastCondition}, ${c.pastFuture.replace('would have', 'will')}.`,
        `If ${c.pastCondition}, ${c.pastFuture.replace('would have', 'was')}.`,
        `If ${c.pastCondition}, ${c.pastFuture.replace('would have', 'have')}.`,
      ],
      explanation:
        'O terceiro condicional combina if + past perfect e would have + particípio para imaginar um passado diferente.',
    },
    {
      type: 'fill',
      prompt: `Complete: “By the time we arrived, ${c.pastEvent} ___ already started.”`,
      answer: 'had',
      explanation:
        'O past perfect (had + particípio) indica que essa ação já havia acontecido antes da nossa chegada.',
    },
    {
      type: 'write',
      prompt: `Reescreva na voz passiva: “${c.active}”`,
      answer: c.passive,
      explanation: `Na passiva do present perfect usamos has/have + been + particípio: ${c.passive}.`,
    },
  ];
}
const easyReading = {
  coffee: 'Emma is at a café. She usually drinks coffee. Today she orders tea. She reads a book.',
  travel:
    'Lucas is in London. He takes a train. The train is faster than the bus. His hotel is near the station.',
  daily:
    'Mia works in an office. She goes to the office by bicycle. On Mondays, she works at home.',
  modals:
    'This is a library. Visitors must keep phones on silent. They can borrow books. They should ask for help when they need it.',
  work: 'Anna has a presentation on Friday. She needs the report by Thursday afternoon. James helps Anna.',
  city: 'The museum opens at ten. It closes at six. On Fridays, it closes at eight in the evening.',
};
const advancedReading = {
  coffee: {
    passage:
      'Although Emma tends to stick to her morning cappuccino, she has recently been reconsidering her caffeine intake. On her latest visit to the café, she opted for herbal tea, partly out of curiosity and partly because she had been struggling to sleep. Her cheese sandwich, however, remained a fixture. Reading by the window before work still gives her a sense of calm that she is reluctant to give up.',
    prompt: 'Qual conclusão é mais bem sustentada pelo texto?',
    options: [
      'Emma has adjusted one habit while retaining others.',
      'Emma has given up her morning routine entirely.',
      'Emma dislikes the food at the café.',
      'Emma has decided never to drink coffee again.',
    ],
    answer: 'Emma has adjusted one habit while retaining others.',
    explanation:
      'Ela troca a bebida, mas mantém o sanduíche e a leitura. O texto não afirma que ela nunca mais beberá café.',
  },
  travel: {
    passage:
      'Having weighed up the cost of a taxi against the convenience of public transport, Lucas settled on the airport express. It was not the cheapest option, but the journey time was predictable, and a strike had made bus services unreliable. He had deliberately booked a hotel within walking distance of the terminal station, knowing that navigating an unfamiliar city with a heavy suitcase could be stressful.',
    prompt: 'O que mais influenciou as escolhas de Lucas?',
    options: [
      'Reliability and ease of travel.',
      'Finding the cheapest possible transport.',
      'Avoiding all forms of public transport.',
      'Staying as close to the airport as possible.',
    ],
    answer: 'Reliability and ease of travel.',
    explanation:
      'O tempo previsível do trem e o hotel perto da estação mostram prioridade à confiabilidade e à facilidade, acima do menor preço.',
  },
  daily: {
    passage:
      'Since her company introduced hybrid working, Mia has found it easier to balance personal commitments with professional responsibilities. She works remotely twice a week, reserving those days for tasks requiring sustained concentration. Office days, by contrast, are devoted to collaboration. Although cycling takes longer than driving, she finds that the exercise helps her arrive feeling more focused.',
    prompt: 'Como Mia organiza sua semana?',
    options: [
      'She matches her work location to the nature of her tasks.',
      'She avoids teamwork whenever possible.',
      'She chooses transport solely to save time.',
      'She works from home only when she is ill.',
    ],
    answer: 'She matches her work location to the nature of her tasks.',
    explanation:
      'Ela usa os dias remotos para concentração e os dias de escritório para colaboração, adequando o local às tarefas.',
  },
  modals: {
    passage:
      'Library users are required to keep their phones on silent, though quiet conversations are permitted in designated areas. Up to five books may be borrowed at a time, provided that no loans are overdue. Renewals can usually be arranged online; however, books reserved by another reader must be returned by the original due date. Visitors are advised to check their accounts regularly rather than rely on reminder emails.',
    prompt: 'Em que situação a renovação de um empréstimo não é permitida?',
    options: [
      'When another reader has reserved the book.',
      'When the borrower has fewer than five books.',
      'When the library sends no reminder email.',
      'When the borrower uses the online system.',
    ],
    answer: 'When another reader has reserved the book.',
    explanation:
      'A ressalva introduzida por however determina a devolução no prazo original de livros reservados por outra pessoa.',
  },
  work: {
    passage:
      'With Friday’s presentation approaching, Anna requested the sales figures by Thursday afternoon at the latest. James volunteered to produce the charts, on the understanding that the underlying data would have been verified beforehand. They scheduled a Wednesday check-in to identify gaps early. Had they waited until the last minute, there would have been little opportunity to correct any inconsistencies.',
    prompt: 'Qual é o principal objetivo da reunião de quarta-feira?',
    options: [
      'To allow time to address problems before the presentation.',
      'To present the final results to the client.',
      'To postpone the deadline until the following week.',
      'To replace the need to verify the sales data.',
    ],
    answer: 'To allow time to address problems before the presentation.',
    explanation:
      'A reunião serve para identificar lacunas cedo e dar tempo para corrigir inconsistências antes de sexta-feira.',
  },
  city: {
    passage:
      'The new museum beside Central Park has extended its Friday opening hours to accommodate visitors who would otherwise struggle to attend during the working week. Admission remains free for children under twelve, while adults pay ten pounds. Despite calls for free entry for everyone, the management argues that ticket revenue is essential to maintaining the permanent collection. Temporary exhibitions may carry an additional charge.',
    prompt: 'O que se pode inferir sobre o horário estendido de sexta-feira?',
    options: [
      'It is intended to make the museum accessible to more working people.',
      'It means all visitors can enter without paying.',
      'It applies only to temporary exhibitions.',
      'It was introduced to reduce maintenance costs.',
    ],
    answer: 'It is intended to make the museum accessible to more working people.',
    explanation:
      'O horário estendido atende quem teria dificuldade para visitar durante a semana de trabalho. Não altera a cobrança de ingresso.',
  },
};
export function getQuestions(topicId, level = 'A1') {
  const t = topics.find((t) => t.id === topicId) || topics[0];
  const themed = [
    {
      type: 'match',
      prompt: `Qual tradução combina com a palavra “${t.word}”?`,
      options: [t.translation, ...t.distractors],
      answer: t.translation,
      explanation: `${t.word} significa ${t.translation}.`,
      vocab: t.word,
    },
    {
      type: 'order',
      prompt: `Monte a frase: “${t.pt}”`,
      words: t.sentence.split(' '),
      answer: t.sentence,
      explanation: `A ordem correta é: ${t.sentence}.`,
    },
    {
      type: 'reading',
      prompt: t.read,
      passage: level === 'A1' ? easyReading[t.id] : t.passage,
      options: t.options,
      answer: t.readAnswer,
      explanation: t.explain,
      ...(level === 'B2' ? advancedReading[t.id] : {}),
    },
  ];
  const g = grammarFor(t.id, level);
  return [themed[0], g[0], themed[1], g[1], themed[2], g[2]].map((q) => ({
    ...q,
    options: q.options ? [...q.options] : undefined,
    words: q.words ? [...q.words] : undefined,
  }));
}
export const typeLabels = {
  choice: 'Gramática',
  fill: 'Complete a frase',
  order: 'Monte a frase',
  write: 'Escrita',
  reading: 'Reading',
  match: 'Associe a palavra',
};
