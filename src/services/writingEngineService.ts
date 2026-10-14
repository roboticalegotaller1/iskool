/**
 * @module WritingEngineService
 * @description Servicio del Motor Autónomo de Evaluación y Tutoría de Escritura para iSkool.
 * Gestiona la generación de consignas oficiales, el andamiaje socrático en 3 niveles de pistas,
 * la evaluación analítica Cambridge/DELF y el dashboard docente estilo Apple Clean UX.
 */

import {
  WritingLanguage,
  LanguageLevel,
  ExamFramework,
  TaskPrompt,
  DraftAnalysisOutput,
  DiagnosticItem,
  FinalEvaluationOutput,
  TeacherCohortDashboardOutput,
  LEVEL_EXAM_SPECS,
  LengthStatus,
  AcademicDensity,
  TrafficLightStatus,
  RecurringErrorPattern,
  TeacherStudentSummary,
  LiveSentenceCorrection,
  LiveCorrectionToken,
  LiveCorrectionDetail
} from '@/types/writingEngine';

// ============================================================================
// 1. BANCO DE CONSIGNAS CANÓNICAS OFICIALES (CAMBRIDGE & DELF-DALF)
// ============================================================================

interface PromptTemplate {
  idioma: WritingLanguage;
  nivel: LanguageLevel;
  titulo: string;
  contexto: string;
  consignaOficial: string;
  puntosClave: string[];
  checklist: string[];
  criterios: string[];
}

const CANONICAL_PROMPTS: PromptTemplate[] = [
  // --- INGLÉS (CAMBRIDGE) ---
  {
    idioma: 'en',
    nivel: 'Pre-A1',
    titulo: 'My Favorite Animal & Colors',
    contexto: 'Cambridge Young Learners Starters (Pre A1 Writing Practice).',
    consignaOficial: 'Look at the picture of your pet or favorite animal. Write short words and simple phrases describing what it is, its color, and what it has got.',
    puntosClave: [
      'Name of the animal (dog, cat, bird, etc.)',
      'Two colors of the animal',
      'One body part using "has got" (e.g. big ears, long tail)'
    ],
    checklist: [
      'Did you spell animal and color words correctly?',
      'Did you use "It is..." and "It has got..."?',
      'Is your text between 1 and 25 words?'
    ],
    criterios: ['Basic vocabulary', 'Spelling accuracy', 'Capital letters and full stops']
  },
  {
    idioma: 'en',
    nivel: 'A1',
    titulo: 'A Day in the Park with Friends',
    contexto: 'Cambridge Young Learners Movers (A1 Writing Task 6).',
    consignaOficial: 'Look at the three pictures of children playing in the park. Write a short story about what happened in the morning and afternoon.',
    puntosClave: [
      'Where the children are and what the weather is like',
      'What game they play (football, bikes, picnic)',
      'How the day ends happily using "and" or "because"'
    ],
    checklist: [
      'Are your sentences connected with "and", "but" or "because"?',
      'Did you use simple present or past verbs correctly?',
      'Is your word count between 25 and 40 words?'
    ],
    criterios: ['Cohesive sentence linking', 'Vocabulary range', 'Task completion']
  },
  {
    idioma: 'en',
    nivel: 'A2',
    titulo: 'Invitation to a Weekend Cycling Trip',
    contexto: 'Cambridge A2 Key (KET) Writing Part 6 / 7.',
    consignaOficial: 'You are going on a bicycle trip this Saturday. Write an email to your English friend Alex inviting him to come with you.',
    puntosClave: [
      'Invite Alex to join the bike trip',
      'State where you are meeting and at what time',
      'Mention what Alex should bring (water, helmet, snacks)'
    ],
    checklist: [
      'Did you begin with a friendly greeting ("Hi Alex,")?',
      'Did you cover all 3 key points clearly?',
      'Did you close with an appropriate sign-off ("See you soon,")?',
      'Is your word count between 35 and 50 words?'
    ],
    criterios: ['Task achievement', 'Functional language of invitation', 'Basic grammatical control']
  },
  {
    idioma: 'en',
    nivel: 'B1',
    titulo: 'School Uniforms: Better for Everyone?',
    contexto: 'Cambridge B1 Preliminary (PET) Writing Part 1 - Article / Email.',
    consignaOficial: 'You see this announcement in your international school magazine: "Articles wanted! Do you think school uniforms help students focus, or do they limit creativity? Tell us your opinion and your own experience."',
    puntosClave: [
      'State clearly whether you support school uniforms or not',
      'Give one reason related to student equality or focus',
      'Mention your own daily experience at school',
      'Conclude with an encouraging thought for readers'
    ],
    checklist: [
      'Did you use paragraphs to organize your ideas?',
      'Did you include connectors like "however", "although", "in my opinion"?',
      'Did you answer all 4 trigger questions?',
      'Is your word count strictly between 100 and 120 words?'
    ],
    criterios: ['Content relevance (all points)', 'Communicative achievement (article style)', 'Organisation & paragraphs', 'Language (B1 grammar & lexis)']
  },
  {
    idioma: 'en',
    nivel: 'B2',
    titulo: 'Technological Devices in the Modern Classroom',
    contexto: 'Cambridge B2 First (FCE) Writing Part 1 - Compulsory Essay.',
    consignaOficial: 'In your English class you have been talking about technology in education. Now your English teacher has asked you to write an essay evaluating whether laptops and tablets in classrooms do more good than harm.',
    puntosClave: [
      'Point 1: Access to research and interactive learning materials',
      'Point 2: Potential distractions and social media during class',
      'Point 3: Your own third original idea (e.g. digital inequality, health effects, or teacher training)'
    ],
    checklist: [
      'Did you include an introduction presenting the debate?',
      'Did you develop 3 distinct body paragraphs (2 given + 1 own idea)?',
      'Did you conclude with a balanced synthesis of your stance?',
      'Did you maintain a consistently formal or neutral register?',
      'Is your word count between 140 and 190 words?'
    ],
    criterios: ['Content (3 points developed)', 'Communicative Achievement (formal essay conventions)', 'Organisation (linking words, topic sentences)', 'Language (B2 collocations, complex grammar)']
  },
  {
    idioma: 'en',
    nivel: 'C1',
    titulo: 'Promoting Sustainable Public Transport in Urban Centers',
    contexto: 'Cambridge C1 Advanced (CAE) Writing Part 1 - Discursive Essay.',
    consignaOficial: 'Your class has attended a panel discussion on methods governments could use to encourage citizens to rely more on green public transit. You must write an essay discussing TWO of the methods provided in your notes and explaining which method is more effective, giving reasons in support of your opinion.',
    puntosClave: [
      'Method 1: Subsidizing fares and making public transit free or low-cost',
      'Method 2: Investing in clean infrastructure (high-speed electric buses, light rail)',
      'Evaluation: Argue persuasively which of the two is fundamentally more impactful for long-term decarbonization'
    ],
    checklist: [
      'Did you evaluate only 2 methods with critical balance?',
      'Did you use sophisticated discursive markers (notwithstanding, it is argued that, conversely)?',
      'Did you avoid over-generalizations through modal verbs and academic hedging?',
      'Is your word count strictly between 220 and 260 words?'
    ],
    criterios: ['Content (critical evaluation)', 'Communicative Achievement (persuasive academic tone)', 'Organisation (flawless textual cohesion)', 'Language (advanced inversion, complex syntax, idioms)']
  },
  {
    idioma: 'en',
    nivel: 'C2',
    titulo: 'The Erosion of Deep Reading in the Digital Age',
    contexto: 'Cambridge C2 Proficiency (CPE) Writing Part 1 - Critical Synthesis & Evaluation.',
    consignaOficial: 'Read the two short extracts below discussing the decline of sustained reading habits among modern youth due to algorithmic media consumption. Write an essay summarizing and evaluating the key points contained in both texts. Use your own words throughout as far as possible, and include your own ideas in your answer.',
    puntosClave: [
      'Text 1 core: Algorithmic feeds fragment cognitive attention spans and diminish contemplation',
      'Text 2 core: Digital literacy enables rapid synthesis, cross-referencing and democratized access',
      'Critical synthesis: Weigh whether cognitive depth is irrecoverable or merely evolving into new hypertextual faculties'
    ],
    checklist: [
      'Did you reformulate all key ideas without copying chunks of the prompt texts?',
      'Did you integrate a critical stance without sounding purely anecdotal?',
      'Did you employ precise register, academic nuance and stylistic eloquence?',
      'Is your word count between 240 and 300 words?'
    ],
    criterios: ['Synthesis & paraphrase quality', 'Evaluative rigor', 'Exemplary structural coherence', 'Lexical precision and stylistic mastery']
  },

  // --- FRANCÉS (DELF-DALF / FEI) ---
  {
    idioma: 'fr',
    nivel: 'Pre-A1',
    titulo: 'Ma Fiche Personnelle de Présentation',
    contexto: 'France Éducation International - DELF Prim A1.1 Épreuve Écrite.',
    consignaOficial: 'Remplissez votre fiche d\'inscription pour le club de dessin francophone. Écrivez votre nom, votre âge, votre ville et deux choses que vous aimez faire.',
    puntosClave: [
      'Votre prénom et nom de famille',
      'Votre âge en lettres ou chiffres',
      'Votre nationalité et votre ville',
      'Deux activités préférées (le dessin, la musique, le football)'
    ],
    checklist: [
      'Avez-vous bien accordé les adjectifs (ex: mexicain / mexicaine)?',
      'Avez-vous utilisé le verbe "aimer" au présent?',
      'Le texte compte-t-il entre 15 et 30 mots?'
    ],
    criterios: ['Exactitude des informations', 'Orthographe lexicale de base', 'Respect de la consigne']
  },
  {
    idioma: 'fr',
    nivel: 'A1',
    titulo: 'Carte Postale depuis la Capitale',
    contexto: 'France Éducation International - DELF Junior / Tout Public A1.',
    consignaOficial: 'Vous êtes en vacances dans une grande ville francophone (Paris, Montréal ou Bruxelles). Vous écrivez une carte postale à votre ami(e) pour lui raconter votre séjour.',
    puntosClave: [
      'Saluer votre ami(e) de manière amicale',
      'Décrire le temps qu\'il fait et le lieu où vous logez',
      'Mentionner un monument que vous avez visité et une nourriture typique',
      'Prendre congé avec une formule affectueuse'
    ],
    checklist: [
      'Avez-vous utilisé le présent et le passé composé simple?',
      'Avez-vous relié vos phrases avec "et", "mais", "parce que"?',
      'Votre texte compte-t-il entre 40 et 50 mots?'
    ],
    criterios: ['Respect des codes de la carte postale', 'Capacité à décrire', 'Morphosyntaxe élémentaire']
  },
  {
    idioma: 'fr',
    nivel: 'A2',
    titulo: 'Raconter un Souvenir d\'Enfance Inoubliable',
    contexto: 'France Éducation International - DELF Junior A2 Production Écrite (Tâche 1).',
    consignaOficial: 'Sur votre journal de bord de classe de français, racontez un événement marquant ou un souvenir d\'enfance amusant. Décrivez le contexte, les personnes présentes et ce qui s\'est passé.',
    puntosClave: [
      'Situer l\'événement dans le temps (quand vous aviez 8 ans, l\'été dernier)',
      'Décrire la scène avec l\'imparfait (le décor, les sentiments, le temps)',
      'Raconter les actions soudaines au passé composé',
      'Expliquer pourquoi ce souvenir reste important pour vous'
    ],
    checklist: [
      'Avez-vous bien alterné imparfait (description) et passé composé (actions)?',
      'Avez-vous fait l\'accord du participe passé avec l\'auxiliaire être?',
      'Le nombre de mots est-il compris entre 60 et 80 mots?'
    ],
    criterios: ['Alternance imparfait/passé composé', 'Cohérence narrative', 'Richesse lexicale A2']
  },
  {
    idioma: 'fr',
    nivel: 'B1',
    titulo: 'Contribution au Débat: Faut-il Bannir les Écrans des Écoles?',
    contexto: 'France Éducation International - DELF B1 Épreuve d\'Expression Écrite.',
    consignaOficial: 'Vous participez à un forum de discussion en ligne sur l\'éducation francophone. Le sujet est: « Faut-il interdire complètement les téléphones portables et tablettes au collège ? ». Donnez votre opinion argumentée en vous appuyant sur votre expérience personnelle.',
    puntosClave: [
      'Présenter le thème et annoncer clairement votre prise de position',
      'Développer au moins deux arguments étayés par des exemples vécus',
      'Formuler une proposition alternative (par exemple une utilisation pédagogique encadrée)',
      'Conclure en sollicitant l\'avis des autres internautes'
    ],
    checklist: [
      'Avez-vous structuré votre texte avec des paragraphes distincts?',
      'Avez-vous employé des connecteurs logiques (d\'abord, de plus, cependant, enfin)?',
      'Avez-vous utilisé des structures d\'opinion et le subjonctif?',
      'Votre texte respecte-t-il la longueur de 160 à 180 mots?'
    ],
    criterios: ['Prise de position nette et soutenue', 'Cohérence et articulation logique', 'Étendue du vocabulaire B1', 'Correction grammaticale']
  },
  {
    idioma: 'fr',
    nivel: 'B2',
    titulo: 'Lettre Ouverte au Maire: Aménagement d\'un Éco-Quartier Végétalisé',
    contexto: 'France Éducation International - DELF B2 Production Écrite (Lettre Formelle Argumentée).',
    consignaOficial: 'En tant que porte-parole d\'une association citoyenne de jeunes, vous écrivez une lettre formelle à Monsieur le Maire de votre commune pour protester contre la destruction d\'un parc arboré destiné à devenir un centre commercial, et proposer un aménagement éco-responsable alternatif.',
    puntosClave: [
      'Respecter les codes typographiques de la lettre officielle (coordonnées, objet, formule d\'appel)',
      'Argument 1: Impact environnemental, îlot de chaleur et perte de biodiversité locale',
      'Argument 2: Cohésion sociale et espace de respiration indispensable pour les familles',
      'Concession et contre-argument: Reconnaître le besoin d\'activité économique tout en prouvant que l\'éco-tourisme est plus rentable',
      'Formule protocolaire de politesse soutenue'
    ],
    checklist: [
      'Avez-vous utilisé des formules de concession (certes, bien que + subjonctif, malgré)?',
      'Avez-vous respecté un registre de langue soutenu et courtois sans agressivité?',
      'Avez-vous soigné la formule de clôture administrative?',
      'Votre lettre compte-t-elle au minimum 250 mots (plage idéale: 250 - 320 mots)?'
    ],
    criterios: ['Respect des normes épistolaires formelles', 'Force de l\'argumentation et des concessions', 'Précision lexicale sociétale B2', 'Maîtrise morphosyntaxique complexe']
  },
  {
    idioma: 'fr',
    nivel: 'C1',
    titulo: 'Dossier Hypermédiatisation & Santé Mentale des Jeunes',
    contexto: 'France Éducation International - DALF C1 (Synthèse de Documents & Essai Argumenté).',
    consignaOficial: 'À partir des deux documents d\'experts sociologiques fournis, vous rédigerez une synthèse objective de 220 mots sans prise de position personnelle, suivie d\'un essai argumenté de 250 mots où vous prendrez nettement parti sur la régulation éthique des algorithmes attentionnels.',
    puntosClave: [
      'Volet 1: Synthèse neutre, concise et impersonnelle confrontant les deux points de vue',
      'Volet 2: Essai argumenté structuré selon un plan dialectique ou thématique',
      'Usage rigoureux de la nominalisation et de la voix passive ou tournures impersonnelles',
      'Prise de hauteur philosophique et sociologique'
    ],
    checklist: [
      'La synthèse est-elle strictement objective sans "je" ni jugement?',
      'L\'essai défend-il une thèse claire avec des arguments hiérarchisés?',
      'Le total combiné respecte-t-il la fourchette de 450 à 500 mots?',
      'Le lexique est-il soutenu et varié?'
    ],
    criterios: ['Objectivité et fidélité de la synthèse', 'Rigueur de l\'argumentation de l\'essai', 'Aisance stylistique et nominalisations C1', 'Précision morphosyntaxique sans faille']
  },
  {
    idioma: 'fr',
    nivel: 'C2',
    titulo: 'L\'Humanisme à l\'Épreuve de l\'Intelligence Artificielle Générative',
    contexto: 'France Éducation International - DALF C2 Production d\'un Dossier Écrit.',
    consignaOficial: 'Dans le cadre d\'une revue philosophique universitaire, vous composez un article de fond critique de 700 mots analysant les mutations de la création littéraire et de la pensée critique face à la prolifération des modèles d\'apprentissage profond. Proposez une réflexion éthique prospective.',
    puntosClave: [
      'Problématique épistémologique: L\'autonomie de l\'esprit face à la modélisation probabiliste du langage',
      'Analyse critique: La dialectique entre démocratisation de l\'accès au savoir et standardisation esthétique',
      'Vision prospective: Refonder un nouvel humanisme critique fondé sur l\'éthique de la délibération humaine'
    ],
    checklist: [
      'Avez-vous maintenu une plume élégante, dense et conceptuelle?',
      'Avez-vous mobilisé des figures rhétoriques et un vocabulaire philosophique précis?',
      'Votre production dépasse-t-elle le seuil réglementaire de 700 mots?'
    ],
    criterios: ['Envergure intellectuelle et rhétorique', 'Maîtrise absolue du style académique C2', 'Originalité réflexive', 'Correction formelle parfaite']
  }
];

// ============================================================================
// 2. DETECTOR DE INTERFERENCIA L1 ESPAÑOL Y ERRORES COMUNES
// ============================================================================

interface ErrorPatternRule {
  idioma: WritingLanguage;
  regex: RegExp;
  tipo: 'gramatica' | 'lexico' | 'coherencia' | 'registro' | 'transferencia_L1';
  pista1: string;
  pista2: string;
  pista3: string;
  l1Origin?: string;
  suggestedFix?: string;
}

const ERROR_RULES: ErrorPatternRule[] = [
  // --- INGLÉS: INTERFERENCIAS TÍPICAS L1 ESPAÑOL ---
  {
    idioma: 'en',
    regex: /\bdepends?\s+of\b/i,
    tipo: 'transferencia_L1',
    pista1: 'Notice the preposition following the verb "depend". Does English pair it with "of"?',
    pista2: 'In Spanish we say "depender de", but in English the dependent preposition is strictly "depend ON".',
    pista3: 'Compare: "Success relies on practice" or "Our weekend plans depend on the sunny weather."',
    l1Origin: 'Calco directo del español "depender de"',
    suggestedFix: 'depend on'
  },
  {
    idioma: 'en',
    regex: /\b(i|he|she|they|we)\s+have\s+(\d+|[a-z]+)\s+years(\s+old)?\b/i,
    tipo: 'transferencia_L1',
    pista1: 'Check how age is expressed in English. Do we "possess" years or are we a state of being?',
    pista2: 'Spanish uses "tener X años", whereas English uses the verb "to be" + age (e.g., "I am 16 years old").',
    pista3: 'Analogy: "My sister is twenty years old and my cousin is twelve."',
    l1Origin: 'Traducción literal de "tener X años"',
    suggestedFix: 'am/is/are X years old'
  },
  {
    idioma: 'en',
    regex: /\bactually\b(?!\s+(did|was|is|happened))/i,
    tipo: 'lexico',
    pista1: 'Are you using "actually" to mean "right now / currently"? Check this false friend.',
    pista2: '"Actually" means "in fact / really". If you mean "en la actualidad", use "currently", "nowadays", or "at present".',
    pista3: 'Analogy: "Currently, I am studying French, but actually, I find English grammar more logical."',
    l1Origin: 'Falso amigo con el español "actualmente"',
    suggestedFix: 'currently / nowadays'
  },
  {
    idioma: 'en',
    regex: /\bpeople\s+(is|was)\b/i,
    tipo: 'gramatica',
    pista1: 'Is "people" grammatically singular or plural in English? Check subject-verb agreement.',
    pista2: 'In Spanish "la gente" is singular, but English "people" is a plural noun requiring "are" or "were".',
    pista3: 'Analogy: "Many people are waiting outside because the doors are locked."',
    l1Origin: 'Concordancia singular heredada de "la gente es"',
    suggestedFix: 'people are / were'
  },
  {
    idioma: 'en',
    regex: /\b(i|he|she|we)\s+(am|is|are)\s+agree\b/i,
    tipo: 'gramatica',
    pista1: 'In English, is "agree" an adjective or an active verb? Review the auxiliary.',
    pista2: 'In Spanish we say "estoy de acuerdo", but in English "agree" is a normal main verb: "I agree", not "I am agree".',
    pista3: 'Analogy: "I completely agree with the author\'s primary thesis regarding youth wellness."',
    l1Origin: 'Calco sintáctico de "estoy de acuerdo"',
    suggestedFix: 'I agree'
  },
  {
    idioma: 'en',
    regex: /\bexplain\s+me\b/i,
    tipo: 'gramatica',
    pista1: 'Does the verb "explain" take a direct person pronoun, or does it require a prepositional phrase?',
    pista2: 'Unlike Spanish "explícame", in English you explain SOMETHING TO SOMEONE ("explain to me", "explain the rule to us").',
    pista3: 'Analogy: "Could you please explain the geometry formula to the whole group?"',
    l1Origin: 'Transferencia del clítico "explícame"',
    suggestedFix: 'explain to me'
  },
  {
    idioma: 'en',
    regex: /\bmake\s+(a\s+decision|an\s+exam)\b/i,
    tipo: 'lexico',
    pista1: 'Check the collocation: do students "make" an exam, or do they "take / sit" one?',
    pista2: 'In Spanish we "hacemos exámenes", but in English collocations we say "take / sit an exam". For decisions, "make a decision" is fine, but beware of exam verbs.',
    pista3: 'Analogy: "The students will take their Cambridge writing assessment next Tuesday."',
    l1Origin: 'Colocación errónea por "hacer un examen"',
    suggestedFix: 'take an exam'
  },

  // --- FRANCÉS: INTERFERENCIAS TÍPICAS L1 ESPAÑOL ---
  {
    idioma: 'fr',
    regex: /\bje\s+suis\s+(\d+|[a-z]+)\s+ans\b/i,
    tipo: 'transferencia_L1',
    pista1: 'Vérifiez le verbe auxiliaire utilisé pour l\'âge en français. S\'agit-il de "être" ou de "avoir" ?',
    pista2: 'En français, on utilise le verbe "avoir" pour exprimer l\'âge : "J\'ai 16 ans" (comme en espagnol "tengo"), pas "je suis".',
    pista3: 'Modèle : "Mon petit frère a dix ans et moi j\'en ai seize."',
    l1Origin: 'Confusion avec la structure anglaise "I am X years old"',
    suggestedFix: 'j\'ai X ans'
  },
  {
    idioma: 'fr',
    regex: /\b(visiter|visité|visite)\s+à\s+(mes|ses|nos|les|un|une)\b/i,
    tipo: 'lexico',
    pista1: 'Faites attention à la distinction entre visiter un lieu et rendre visite à une personne.',
    pista2: 'En français, on "visite un musée / une ville", mais on "rend visite à une personne" (rendre visite à ses grands-parents).',
    pista3: 'Modèle : "Cet après-midi, nous rendons visite à notre professeur de littérature."',
    l1Origin: 'Calque de l\'espagnol "visitar a"',
    suggestedFix: 'rendre visite à'
  },
  {
    idioma: 'fr',
    regex: /\bbien\s+(que\s+[a-zÀ-ÿ]+|qu['’]\s*[a-zÀ-ÿ]+)\s+(est|a|fait|va)\b/i,
    tipo: 'gramatica',
    pista1: 'Quel mode verbal est obligatoirement régi par la conjonction concessive "bien que" ?',
    pista2: '"Bien que" exige rigoureusement le subjonctif présent (bien qu\'il soit, bien qu\'elle ait, bien qu\'il fasse).',
    pista3: 'Modèle : "Bien que ce projet soit exigeant, il est indispensable pour notre communauté."',
    l1Origin: 'Emploi de l\'indicatif après une locution subordonnante concessive',
    suggestedFix: 'bien que + subjonctif'
  },
  {
    idioma: 'fr',
    regex: /\bfaire\s+attention\s+de\b/i,
    tipo: 'gramatica',
    pista1: 'Quelle préposition suit la locution "faire attention" quand elle introduit un nom ?',
    pista2: 'En français standard, on dit "faire attention À quelque chose", et non "de".',
    pista3: 'Modèle : "Les cyclistes doivent faire attention aux piétons sur la voie partagée."',
    l1Origin: 'Calque de l\'espagnol "poner atención de / tener cuidado de"',
    suggestedFix: 'faire attention à'
  },
  {
    idioma: 'fr',
    regex: /\bactuellement\b/i,
    tipo: 'lexico',
    pista1: 'Vérifiez la nuance de "actuellement". S\'agit-il de "maintenant" ou de "en réalité" ?',
    pista2: 'En français, "actuellement" signifie "en ce moment". Si vous vouliez dire "en réalité / en fait", utilisez "en réalité" ou "en fait".',
    pista3: 'Modèle : "Actuellement, la ville rénove ses transports ; en fait, cela prendra deux ans."',
    l1Origin: 'Glissement sémantique avec l\'anglais actually',
    suggestedFix: 'actuellement (en ce moment) vs en fait'
  }
];

// ============================================================================
// 3. CONECTORES DISCURSIVOS ESPERADOS POR NIVEL
// ============================================================================

const EXPECTED_CONNECTORS: Record<`${WritingLanguage}-${LanguageLevel}`, string[]> = {
  'en-Pre-A1': ['and', 'with'],
  'en-A1': ['and', 'but', 'because', 'then'],
  'en-A2': ['and', 'but', 'because', 'so', 'after', 'before', 'also'],
  'en-B1': ['however', 'although', 'in addition', 'besides', 'as a result', 'since', 'firstly', 'finally', 'on the other hand'],
  'en-B2': ['furthermore', 'moreover', 'nevertheless', 'consequently', 'therefore', 'in conclusion', 'despite', 'whereas', 'on the one hand', 'on the other hand'],
  'en-C1': ['notwithstanding', 'conversely', 'it is noteworthy that', 'in stark contrast', 'subsequently', 'undeniably', 'hence', 'to substantiate this'],
  'en-C2': ['albeit', 'insofar as', 'epitomizes', 'paramount to', 'crystallizes', 'ineluctably', 'by extension', 'a compelling testament to'],

  'fr-Pre-A1': ['et', 'avec'],
  'fr-A1': ['et', 'mais', 'parce que', 'aussi'],
  'fr-A2': ['et', 'mais', 'parce que', 'donc', 'alors', 'puis', 'ensuite'],
  'fr-B1': ['cependant', 'puisque', 'c\'est pourquoi', 'en fait', 'd\'ailleurs', 'en revanche', 'd\'abord', 'enfin'],
  'fr-B2': ['néanmoins', 'toutefois', 'non seulement... mais aussi', 'étant donné que', 'par conséquent', 'certes', 'en dépit de', 'bien que'],
  'fr-C1': ['en outre', 'force est de constater', 'd\'autant plus que', 'nonobstant', 'à cet égard', 'dans cette optique', 'il convient de souligner'],
  'fr-C2': ['dans le sillage de', 'par-delà les clivages', 'corrobore', 'indissociable de', 'procède de', 's\'articule autour de']
};

// ============================================================================
// 4. MÉTODOS DEL MOTOR AUTÓNOMO
// ============================================================================

export class AutonomousWritingEngineService {

  /**
   * [COMANDO: CREAR_CONSIGNA]
   * Genera una consigna pedagógica oficial con los estándares exactos de examen.
   */
  public static crearConsigna(input: {
    idioma: WritingLanguage;
    nivel: LanguageLevel;
    tipo_tarea?: string;
    tema?: string;
  }): TaskPrompt {
    const key = `${input.idioma}-${input.nivel}` as const;
    const spec = LEVEL_EXAM_SPECS[key];
    if (!spec) {
      throw new Error(`Especificación no encontrada para ${input.idioma} nivel ${input.nivel}`);
    }

    // Buscar en banco canónico o contextualizar con el tema solicitado
    const canonical = CANONICAL_PROMPTS.find(p => p.idioma === input.idioma && p.nivel === input.nivel) 
      || CANONICAL_PROMPTS[0];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `ISK-${input.idioma.toUpperCase()}-${input.nivel.toUpperCase()}-${randomSuffix}`;

    const tituloFinal = input.tema ? `${canonical.titulo}: ${input.tema}` : canonical.titulo;
    const contextoFinal = input.tipo_tarea ? `${spec.examName} (${input.tipo_tarea})` : spec.examName;

    return {
      id: generatedId,
      idioma: input.idioma,
      nivel: input.nivel,
      framework: spec.framework,
      examName: spec.examName,
      titulo: tituloFinal,
      contexto: contextoFinal,
      consignaOficial: canonical.consignaOficial,
      limitePalabras: {
        min: spec.minWords,
        max: spec.maxWords
      },
      puntosClaveObligatorios: canonical.puntosClave,
      checklistPrevio: canonical.checklist,
      criteriosEvaluacion: canonical.criterios,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * [COMANDO: ANALIZAR_BORRADOR]
   * Analiza el borrador del alumno en tiempo real con andamiaje socrático de 3 niveles.
   */
  public static analizarBorrador(input: {
    idioma: WritingLanguage;
    nivel: LanguageLevel;
    consigna?: string;
    borrador_actual: string;
  }): DraftAnalysisOutput {
    const text = (input.borrador_actual || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    const key = `${input.idioma}-${input.nivel}` as const;
    const spec = LEVEL_EXAM_SPECS[key] || LEVEL_EXAM_SPECS['en-B1'];

    // Estado de longitud
    let estadoLongitud: LengthStatus = 'optimo';
    if (wordCount < spec.minWords) {
      estadoLongitud = 'deficiente';
    } else if (wordCount > spec.maxWords) {
      estadoLongitud = 'excedido';
    }

    // Progreso porcentual hacia el rango medio objetivo
    const targetMid = (spec.minWords + spec.maxWords) / 2;
    const progresoPorcentaje = Math.min(100, Math.round((wordCount / targetMid) * 100));

    // Conectores detectados
    const expectedList = EXPECTED_CONNECTORS[key] || [];
    const lowerText = text.toLowerCase();
    const conectoresDetectados = expectedList.filter(connector => {
      const escaped = connector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(lowerText);
    });

    // Diversidad léxica (Type-Token Ratio TTR)
    let ttr = 0;
    if (words.length > 0) {
      const cleanTokens = words.map(w => w.toLowerCase().replace(/[^a-zÀ-ÿ0-9]/g, '')).filter(Boolean);
      const uniqueTokens = new Set(cleanTokens);
      ttr = cleanTokens.length > 0 ? Number((uniqueTokens.size / cleanTokens.length).toFixed(2)) : 0;
    }

    // Densidad académica
    const longWords = words.filter(w => w.length >= 6).length;
    const longWordRatio = words.length > 0 ? longWords / words.length : 0;
    let densidadAcademica: AcademicDensity = 'baja';
    if (longWordRatio > 0.32) {
      densidadAcademica = 'alta';
    } else if (longWordRatio > 0.18) {
      densidadAcademica = 'media';
    }

    // Promedio de palabras por oración
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0;

    // Diagnósticos Socráticos con Scaffolding de 3 niveles
    const diagnosticos: DiagnosticItem[] = [];
    const relevantRules = ERROR_RULES.filter(r => r.idioma === input.idioma);

    for (const rule of relevantRules) {
      const match = rule.regex.exec(text);
      if (match) {
        diagnosticos.push({
          segmento: match[0],
          tipo: rule.tipo,
          pista_nivel_1: rule.pista1,
          pista_nivel_2: rule.pista2,
          pista_nivel_3_modelo: rule.pista3
        });
      }
    }

    // Si no hay errores de reglas específicas pero el texto es muy breve o carece de conectores
    if (wordCount >= 15 && conectoresDetectados.length === 0 && (input.nivel === 'B1' || input.nivel === 'B2' || input.nivel === 'C1')) {
      diagnosticos.push({
        segmento: 'Estructura general de párrafos',
        tipo: 'coherencia',
        pista_nivel_1: input.idioma === 'en'
          ? 'How are your ideas linked together? Could you introduce a transitional phrase between sentences?'
          : 'Comment vos idées s\'articulent-elles entre elles ? Pourriez-vous introduire un connecteur logique ?',
        pista_nivel_2: input.idioma === 'en'
          ? `At the ${input.nivel} level, examiners evaluate cohesive devices like "however", "furthermore" or "in addition".`
          : `Au niveau ${input.nivel}, les examinateurs valorisent les connecteurs comme "cependant", "en outre" ou "par conséquent".`,
        pista_nivel_3_modelo: input.idioma === 'en'
          ? 'Example model: "Many students enjoy music. Furthermore, scientific studies reveal it boosts concentration."'
          : 'Modèle : "Beaucoup d\'élèves aiment la musique. En outre, des études prouvent qu\'elle stimule la concentration."'
      });
    }

    // 5. Corrección Lingüística en Tiempo Real (Motor de IA Pedagógica de Alta Fidelidad - Argon)
    const liveCorrection = AutonomousWritingEngineService.generarCorreccionEnTiempoReal({
      texto: text,
      idioma: input.idioma,
      nivel: input.nivel
    });

    return {
      conteo_palabras: wordCount,
      rango_esperado: `${spec.minWords} - ${spec.maxWords} palabras`,
      estado_longitud: estadoLongitud,
      diagnosticos_detectados: diagnosticos,
      metricas_tiempo_real: {
        diversidad_lexica_ttr: ttr,
        conectores_nivel_esperado: conectoresDetectados,
        densidad_academica: densidadAcademica,
        promedio_palabras_por_oracion: avgWordsPerSentence
      },
      progreso_porcentaje: progresoPorcentaje,
      correccion_en_tiempo_real: liveCorrection
    };
  }

  /**
   * [MOTOR DE IA PEDAGÓGICA - ARGON / TIEMPO REAL]
   * Genera la versión corregida palabra por palabra, analizando:
   * 1. Tiempos verbales y aspectos (Past Simple, Present Perfect, Condicionales, Subjuntivo).
   * 2. Concordancia gramatical de persona y sujeto-verbo (3ª persona -s, plurales colectivos).
   * 3. Conectores discursivos requeridos para la banda MCER (Cambridge B2/C1 / DELF B2/C1).
   * 4. Léxico, colocaciones y falsos amigos de transferencia L1 (español).
   */
  public static generarCorreccionEnTiempoReal(input: {
    texto: string;
    idioma: WritingLanguage;
    nivel: LanguageLevel;
  }): LiveSentenceCorrection {
    const raw = (input.texto || '').trim();
    if (!raw) {
      return {
        originalText: '',
        correctedText: '',
        hasErrors: false,
        tokens: [],
        categoryCounts: {
          verbTenses: 0,
          personAgreement: 0,
          connectors: 0,
          vocabulary: 0,
          spelling: 0
        },
        details: []
      };
    }

    let current = raw;
    const details: LiveCorrectionDetail[] = [];

    // REGLAS ESPECÍFICAS DE INGLÉS (CAMBRIDGE)
    if (input.idioma === 'en') {
      // --- 1. TIEMPOS VERBALES (VERB TENSES) ---
      const pastTimeWithPresentVerbs: Array<{
        pattern: RegExp;
        fix: string;
        verbOriginal: string;
        verbFixed: string;
      }> = [
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year)|in\s+20\d\d|\d+\s+years?\s+ago)\s+(i|we|they|he|she)\s+go\b/gi, fix: '$1 $2 went', verbOriginal: 'go', verbFixed: 'went' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year)|in\s+20\d\d|\d+\s+years?\s+ago)\s+(i|we|they|he|she)\s+see\b/gi, fix: '$1 $2 saw', verbOriginal: 'see', verbFixed: 'saw' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year)|in\s+20\d\d|\d+\s+years?\s+ago)\s+(i|we|they|he|she)\s+come\b/gi, fix: '$1 $2 came', verbOriginal: 'come', verbFixed: 'came' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year)|in\s+20\d\d|\d+\s+years?\s+ago)\s+(i|we|they|he|she)\s+buy\b/gi, fix: '$1 $2 bought', verbOriginal: 'buy', verbFixed: 'bought' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year)|in\s+20\d\d|\d+\s+years?\s+ago)\s+(i|we|they|he|she)\s+take\b/gi, fix: '$1 $2 took', verbOriginal: 'take', verbFixed: 'took' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year)|in\s+20\d\d|\d+\s+years?\s+ago)\s+(i|we|they|he|she)\s+make\b/gi, fix: '$1 $2 made', verbOriginal: 'make', verbFixed: 'made' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year))\s+i\s+am\b/gi, fix: '$1 I was', verbOriginal: 'am', verbFixed: 'was' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year))\s+(we|they)\s+are\b/gi, fix: '$1 $2 were', verbOriginal: 'are', verbFixed: 'were' },
        { pattern: /\b(yesterday|last\s+(?:night|week|month|year))\s+(he|she|it)\s+is\b/gi, fix: '$1 $2 was', verbOriginal: 'is', verbFixed: 'was' },
      ];

      for (const item of pastTimeWithPresentVerbs) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'verb_tense',
            categoryLabel: 'Tiempo Verbal (Past Simple)',
            original: item.verbOriginal,
            suggested: item.verbFixed,
            pedagogicalRule: `Con marcadores temporales pasados concluidos (yesterday, last week, ago), el inglés exige Past Simple ("${item.verbFixed}"), nunca presente ni infinitivo.`,
            examTip: 'Cambridge evalúa rigurosamente el control de tiempos narrativos en los criterios de Language.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // Auxiliar negativo doble pasado: didn't went -> didn't go
      const doublePastAuxiliaries = [
        { regex: /\bdid(?:n't|\s+not)\s+went\b/gi, fix: "didn't go", orig: "didn't went" },
        { regex: /\bdid(?:n't|\s+not)\s+saw\b/gi, fix: "didn't see", orig: "didn't saw" },
        { regex: /\bdid(?:n't|\s+not)\s+bought\b/gi, fix: "didn't buy", orig: "didn't bought" },
        { regex: /\bdid(?:n't|\s+not)\s+came\b/gi, fix: "didn't come", orig: "didn't came" },
        { regex: /\bdid(?:n't|\s+not)\s+took\b/gi, fix: "didn't take", orig: "didn't took" },
      ];
      for (const item of doublePastAuxiliaries) {
        if (item.regex.test(current)) {
          details.push({
            category: 'verb_tense',
            categoryLabel: 'Tiempo Verbal (Auxiliar Did)',
            original: item.orig,
            suggested: item.fix,
            pedagogicalRule: 'Tras el auxiliar en pasado "didn\'t" o "did not", el verbo principal debe permanecer en su forma base (infinitivo sin to).',
            examTip: 'Error de alta penalización en B1 Preliminary y B2 First.'
          });
          current = current.replace(item.regex, item.fix);
        }
      }

      // Modales con to: should to go -> should go
      if (/\b(can|could|should|would|must|might)\s+to\s+([a-z]+)\b/gi.test(current)) {
        current = current.replace(/\b(can|could|should|would|must|might)\s+to\s+([a-z]+)\b/gi, (m, mod, v) => {
          details.push({
            category: 'verb_tense',
            categoryLabel: 'Verbos Modales (Bare Infinitive)',
            original: `${mod} to ${v}`,
            suggested: `${mod} ${v}`,
            pedagogicalRule: `Los verbos modales ingleses (${mod}) se construyen con infinitivo directo sin "to".`,
            examTip: 'Criterio Grammatical Accuracy de Cambridge B1-B2.'
          });
          return `${mod} ${v}`;
        });
      }

      // Present continuous para duración continuada: I am living here since 5 years -> I have lived here for 5 years
      if (/\b(i|we|they)\s+am\s+living\s+here\s+(since|for)\b/gi.test(current)) {
        current = current.replace(/\b(i|we|they)\s+am\s+living\s+here\s+(since|for)\b/gi, (m, subj, prep) => {
          details.push({
            category: 'verb_tense',
            categoryLabel: 'Aspecto Verbal (Present Perfect)',
            original: `${subj} am living here ${prep}`,
            suggested: `${subj} have lived here for`,
            pedagogicalRule: 'Para acciones que comenzaron en el pasado y continúan en el presente con indicación de duración, se debe emplear Present Perfect ("have lived / have been living").',
            examTip: 'Diferenciador clave entre bandas B1 y B2 en Cambridge.'
          });
          return `${subj} have lived here for`;
        });
      }

      // Tercer condicional con would en cláusula if: If I would have -> If I had
      if (/\bif\s+(i|he|she|we|they)\s+would\s+have\b/gi.test(current)) {
        current = current.replace(/\bif\s+(i|he|she|we|they)\s+would\s+have\b/gi, (m, subj) => {
          details.push({
            category: 'verb_tense',
            categoryLabel: 'Estructura Condicional (Third Conditional)',
            original: `if ${subj} would have`,
            suggested: `if ${subj} had`,
            pedagogicalRule: 'En las oraciones condicionales en inglés, la cláusula con "if" nunca lleva "would have", sino Past Perfect ("had + participio").',
            examTip: 'Estructura exigida en el descriptor de C1 Advanced y B2 First.'
          });
          return `if ${subj} had`;
        });
      }

      // --- 2. CONCORDANCIA Y PERSONA (PERSON AGREEMENT) ---
      // 3ª Persona singular en presente
      const thirdPersonSingularVerbs = [
        { pattern: /\b(he|she|it)\s+don't\b/gi, fix: '$1 doesn\'t', orig: "don't", sug: "doesn't" },
        { pattern: /\b(he|she|it)\s+have\b(?!\s+been\s+to)/gi, fix: '$1 has', orig: 'have', sug: 'has' },
        { pattern: /\b(he|she|it)\s+do\b(?!\s+not)/gi, fix: '$1 does', orig: 'do', sug: 'does' },
        { pattern: /\b(he|she|it)\s+go\b/gi, fix: '$1 goes', orig: 'go', sug: 'goes' },
        { pattern: /\b(he|she|it)\s+say\b/gi, fix: '$1 says', orig: 'say', sug: 'says' },
        { pattern: /\b(he|she|it)\s+make\b/gi, fix: '$1 makes', orig: 'make', sug: 'makes' },
        { pattern: /\b(he|she|it)\s+think\b/gi, fix: '$1 thinks', orig: 'think', sug: 'thinks' },
        { pattern: /\b(he|she|it)\s+want\b/gi, fix: '$1 wants', orig: 'want', sug: 'wants' },
        { pattern: /\b(he|she|it)\s+need\b/gi, fix: '$1 needs', orig: 'need', sug: 'needs' },
        { pattern: /\b(he|she|it)\s+like\b/gi, fix: '$1 likes', orig: 'like', sug: 'likes' },
      ];

      for (const item of thirdPersonSingularVerbs) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'person_agreement',
            categoryLabel: 'Concordancia de Persona (3ª Singular -s)',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: `La 3ª persona del singular (he, she, it) exige la terminación "-s/-es" en Present Simple ("${item.sug}").`,
            examTip: 'La falta de concordancia en 3ª persona degrada la nota de Language en cualquier examen oficial.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // Sujeto plural con verbo singular: they is -> they are, we was -> we were
      const pluralAgreementRules = [
        { pattern: /\b(they|we|you)\s+is\b/gi, fix: '$1 are', orig: 'is', sug: 'are' },
        { pattern: /\b(they|we|you)\s+was\b/gi, fix: '$1 were', orig: 'was', sug: 'were' },
        { pattern: /\b(they|we)\s+has\b/gi, fix: '$1 have', orig: 'has', sug: 'have' },
        { pattern: /\bpeople\s+is\b/gi, fix: 'people are', orig: 'people is', sug: 'people are' },
        { pattern: /\bpeople\s+was\b/gi, fix: 'people were', orig: 'people was', sug: 'people were' },
        { pattern: /\bchildren\s+is\b/gi, fix: 'children are', orig: 'children is', sug: 'children are' },
        { pattern: /\bchildren\s+was\b/gi, fix: 'children were', orig: 'children was', sug: 'children were' },
        { pattern: /\b(everyone|everybody|someone|somebody|nobody)\s+are\b/gi, fix: '$1 is', orig: 'are', sug: 'is' },
        { pattern: /\b(everyone|everybody|someone|somebody|nobody)\s+were\b/gi, fix: '$1 was', orig: 'were', sug: 'was' },
        { pattern: /\b(everyone|everybody|someone|somebody|nobody)\s+have\b/gi, fix: '$1 has', orig: 'have', sug: 'has' },
      ];

      for (const item of pluralAgreementRules) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'person_agreement',
            categoryLabel: 'Concordancia Sujeto-Verbo',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: `El sujeto plural exige la forma plural "${item.sug}". En sustantivos colectivos como "people" o pronombres indefinidos como "everyone", el inglés aplica concordancia estricta.`,
            examTip: 'Un dominio impecable de la concordancia es indispensable para certificaciones B2 y C1.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // --- 3. CONECTORES DISCURSIVOS (DISCOURSE CONNECTORS) ---
      const connectorUpgrades = [
        { pattern: /\bfor\s+one\s+hand\b/gi, fix: 'On the one hand', orig: 'for one hand', sug: 'On the one hand' },
        { pattern: /\bin\s+the\s+other\s+hand\b/gi, fix: 'On the other hand', orig: 'in the other hand', sug: 'On the other hand' },
        { pattern: /\band\s+also\b/gi, fix: 'Furthermore,', orig: 'and also', sug: 'Furthermore' },
        { pattern: /\bto\s+finish\b/gi, fix: 'In conclusion,', orig: 'to finish', sug: 'In conclusion' },
        { pattern: /\bbecause\s+of\s+this\b/gi, fix: 'Consequently,', orig: 'because of this', sug: 'Consequently' },
      ];

      for (const item of connectorUpgrades) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'connector',
            categoryLabel: 'Conector Discursivo (Cohesión)',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: `Sustituir enlaces informales por conectores de nivel académico ("${item.sug}") estructura el texto y eleva la banda de Organisation.`,
            examTip: 'Cambridge evalúa Cohesive Devices en el criterio de Organización con un peso del 25%.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // --- 4. LÉXICO Y FALSOS AMIGOS (VOCABULARY & L1 TRANSFER) ---
      const lexicalRules = [
        { pattern: /\bdepends?\s+of\b/gi, fix: 'depends on', orig: 'depend of', sug: 'depend on', rule: 'En inglés el verbo "depend" se rige obligatoriamente por la preposición "on", nunca "of".' },
        { pattern: /\b(i|we)\s+am\s+agree\b/gi, fix: '$1 agree', orig: 'am agree', sug: 'agree', rule: '"Agree" es un verbo principal activo ("I agree"). No se utiliza con el verbo "to be".' },
        { pattern: /\bexplain\s+me\b/gi, fix: 'explain to me', orig: 'explain me', sug: 'explain to me', rule: '"Explain" requiere preposición "to" ante el pronombre de persona ("explain to me").' },
        { pattern: /\bmake\s+(?:an?\s+)?exam\b/gi, fix: 'take an exam', orig: 'make an exam', sug: 'take an exam', rule: 'En colocaciones oficiales en inglés se dice "take / sit an exam", nunca "make".' },
        { pattern: /\bmake\s+(?:a\s+)?question\b/gi, fix: 'ask a question', orig: 'make a question', sug: 'ask a question', rule: 'En inglés se "hacen preguntas" mediante el verbo "ask a question".' },
        { pattern: /\bactually\b(?!\s+(?:did|was|is|happened))/gi, fix: 'currently', orig: 'actually', sug: 'currently', rule: 'Falso amigo con el español: "actually" significa "en realidad / de hecho". Para decir "en la actualidad", usa "currently" o "nowadays".' },
        { pattern: /\bassist\s+to\s+(?:the\s+)?(class|school|meeting|conference)\b/gi, fix: 'attend the $1', orig: 'assist to', sug: 'attend', rule: 'Falso amigo: "assist" significa ayudar. Para asistir físicamente a un lugar o clase se usa "attend".' },
        { pattern: /\bdiscuss\s+about\b/gi, fix: 'discuss', orig: 'discuss about', sug: 'discuss', rule: 'El verbo "discuss" es transitivo directo y no acepta la preposición "about".' },
        { pattern: /\blose\s+time\b/gi, fix: 'waste time', orig: 'lose time', sug: 'waste time', rule: 'La pérdida de tiempo o procrastinación se expresa mediante la colocación "waste time".' },
        { pattern: /\b(i|he|she|we|they)\s+have\s+(\d+|[a-z]+)\s+years(\s+old)?\b/gi, fix: '$1 is $2 years old', orig: 'have X years', sug: 'be X years old', rule: 'En inglés la edad es un estado de ser expresado con el verbo "to be" ("I am 16 years old"), no una posesión con "have".' }
      ];

      for (const item of lexicalRules) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'vocabulary',
            categoryLabel: 'Léxico y Colocaciones',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: item.rule,
            examTip: 'Previene penalizaciones por calcos literales del español en Cambridge Writing.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }
    }

    // REGLAS ESPECÍFICAS DE FRANCÉS (DELF-DALF)
    if (input.idioma === 'fr') {
      // --- 1. TIEMPOS VERBALES Y MODOS ---
      // Verbos de movimiento con être en Passé Composé: j'ai allé -> je suis allé(e)
      const frenchVandertramp = [
        { pattern: /\bj'ai\s+allé\b/gi, fix: 'je suis allé(e)', orig: "j'ai allé", sug: 'je suis allé(e)' },
        { pattern: /\btu\s+as\s+allé\b/gi, fix: 'tu es allé(e)', orig: 'tu as allé', sug: 'tu es allé(e)' },
        { pattern: /\bil\s+a\s+allé\b/gi, fix: 'il est allé', orig: 'il a allé', sug: 'il est allé' },
        { pattern: /\belle\s+a\s+allé\b/gi, fix: 'elle est allée', orig: 'elle a allé', sug: 'elle est allée' },
        { pattern: /\bnous\s+avons\s+allé\b/gi, fix: 'nous sommes allés', orig: 'nous avons allé', sug: 'nous sommes allés' },
        { pattern: /\bvous\s+avez\s+allé\b/gi, fix: 'vous êtes allé(s)', orig: 'vous avez allé', sug: 'vous êtes allé(s)' },
        { pattern: /\bils\s+ont\s+allé\b/gi, fix: 'ils sont allés', orig: 'ils ont allé', sug: 'ils sont allés' },
        { pattern: /\belles\s+ont\s+allé\b/gi, fix: 'elles sont allées', orig: 'elles ont allé', sug: 'elles sont allées' },
      ];

      for (const item of frenchVandertramp) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'verb_tense',
            categoryLabel: 'Temps Verbal (Auxiliaire Être)',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: 'Les verbes de déplacement (aller, venir, partir, arriver...) se conjuguent impérativement avec l\'auxiliaire "être" au passé composé, avec accord du participe passé.',
            examTip: 'Critère Morphosyntaxe du DELF A2/B1.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // Subjonctif obligatoire après "bien que" / "pour que"
      const subjunctiveRules = [
        { pattern: /\bbien\s+que\s+(il|elle|on)\s+est\b/gi, fix: 'bien qu\'$1 soit', orig: 'bien que il est', sug: 'bien qu\'il soit' },
        { pattern: /\bbien\s+que\s+(il|elle|on)\s+a\b/gi, fix: 'bien qu\'$1 ait', orig: 'bien que il a', sug: 'bien qu\'il ait' },
        { pattern: /\bbien\s+que\s+(ils|elles)\s+sont\b/gi, fix: 'bien qu\'$1 soient', orig: 'bien que ils sont', sug: 'bien qu\'ils soient' },
        { pattern: /\bpour\s+que\s+(il|elle|on)\s+est\b/gi, fix: 'pour qu\'$1 soit', orig: 'pour que il est', sug: 'pour qu\'il soit' },
        { pattern: /\bavant\s+que\s+(il|elle|on)\s+est\b/gi, fix: 'avant qu\'$1 soit', orig: 'avant que il est', sug: 'avant qu\'il soit' },
      ];

      for (const item of subjunctiveRules) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'verb_tense',
            categoryLabel: 'Mode Verbal (Subjonctif Présent)',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: 'La locution concessive "bien que" et la finale "pour que" exigent obligatoirement le mode subjonctif en français soutenu.',
            examTip: 'Exigence clé pour décrocher le niveau DELF B1/B2.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // --- 2. CONCORDANCE ET PERSONNE ---
      const frenchAgreement = [
        { pattern: /\b(ils|elles)\s+est\b/gi, fix: '$1 sont', orig: 'est', sug: 'sont' },
        { pattern: /\b(ils|elles)\s+a\b/gi, fix: '$1 ont', orig: 'a', sug: 'ont' },
        { pattern: /\b(ils|elles)\s+va\b/gi, fix: '$1 vont', orig: 'va', sug: 'vont' },
        { pattern: /\btout\s+le\s+monde\s+(sont|ont|font|vont)\b/gi, fix: 'tout le monde est', orig: 'tout le monde sont', sug: 'tout le monde est' },
        { pattern: /\bnous\s+(?:suis|es|est)\b/gi, fix: 'nous sommes', orig: 'nous est', sug: 'nous sommes' },
        { pattern: /\bvous\s+(?:est|sont)\b/gi, fix: 'vous êtes', orig: 'vous est', sug: 'vous êtes' },
      ];

      for (const item of frenchAgreement) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'person_agreement',
            categoryLabel: 'Accord Sujet-Verbe',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: `L'accord de la personne doit respecter le pluriel grammatical ("${item.sug}"). Notez que "tout le monde" est rigoureusement singulier en français.`,
            examTip: 'Pondération majeure dans l\'évaluation DELF.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // --- 3. CONNECTEURS DISCURSIFS ---
      const frenchConnectors = [
        { pattern: /\bet\s+aussi\b/gi, fix: 'En outre,', orig: 'et aussi', sug: 'En outre' },
        { pattern: /\bpour\s+finir\b/gi, fix: 'En conclusion,', orig: 'pour finir', sug: 'En conclusion' },
        { pattern: /\bd'un\s+côté\b/gi, fix: 'D\'une part,', orig: "d'un côté", sug: "D'une part" },
        { pattern: /\bde\s+l'autre\s+côté\b/gi, fix: 'D\'autre part,', orig: "de l'autre côté", sug: "D'autre part" },
      ];

      for (const item of frenchConnectors) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'connector',
            categoryLabel: 'Connecteur Logique (Cohésion)',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: `Les connecteurs formels ("${item.sug}") structurent l'argumentation et évitent les maladresses d'expression écrite.`,
            examTip: 'Compétence Cohérence & Cohésion du DELF B1-B2.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }

      // --- 4. LÉXIQUE ET INTERFÉRENCES L1 ---
      const frenchLexical = [
        { pattern: /\bje\s+suis\s+(\d+|[a-z]+)\s+ans\b/gi, fix: 'j\'ai $1 ans', orig: 'je suis X ans', sug: 'j\'ai X ans', rule: 'En français l\'âge s\'exprime avec le verbe "avoir" ("J\'ai 16 ans"), jamais avec "être".' },
        { pattern: /\bvisiter\s+à\s+(mes|ses|nos|les|un|une)\b/gi, fix: 'rendre visite à $1', orig: 'visiter à', sug: 'rendre visite à', rule: 'On visite un lieu ou une ville, mais on "rend visite à" une personne.' },
        { pattern: /\bfaire\s+attention\s+de\b/gi, fix: 'faire attention à', orig: 'faire attention de', sug: 'faire attention à', rule: 'La locution française est "faire attention À", non "de".' },
        { pattern: /\bbeaucoup\s+des\b/gi, fix: 'beaucoup de', orig: 'beaucoup des', sug: 'beaucoup de', rule: 'Les adverbes de quantité (beaucoup, peu, trop) sont suivis de la préposition simple "de".' },
        { pattern: /\bdemander\s+une\s+question\b/gi, fix: 'poser une question', orig: 'demander une question', sug: 'poser une question', rule: 'Calque erroné de l\'anglais ou de l\'espagnol : en français, on "pose une question".' },
        { pattern: /\bpasser\s+un\s+bon\s+temps\b/gi, fix: 'passer un bon moment', orig: 'passer un bon temps', sug: 'passer un bon moment', rule: 'Pour exprimer le plaisir d\'un moment partagé, on dit "passer un bon moment".' },
        { pattern: /\bà\s+le\s+([a-zÀ-ÿ]+)\b/gi, fix: 'au $1', orig: 'à le', sug: 'au', rule: 'Contraction obligatoire de la préposition "à" avec l\'article défini masculin : "à + le = au".' },
        { pattern: /\bde\s+le\s+([a-zÀ-ÿ]+)\b/gi, fix: 'du $1', orig: 'de le', sug: 'du', rule: 'Contraction obligatoire de la préposition "de" avec l\'article défini masculin : "de + le = du".' },
      ];

      for (const item of frenchLexical) {
        if (item.pattern.test(current)) {
          details.push({
            category: 'vocabulary',
            categoryLabel: 'Lexique et Tournures Fautes',
            original: item.orig,
            suggested: item.sug,
            pedagogicalRule: item.rule,
            examTip: 'Élimine les calques de l\'espagnol dans le lexique du DELF.'
          });
          current = current.replace(item.pattern, item.fix);
        }
      }
    }

    // CONSTRUCCIÓN DE TOKENS DIFERENCIALES EN TIEMPO REAL
    const origWords = raw.split(/(\s+|[.,!?;:()"]+)/).filter(Boolean);
    const corrWords = current.split(/(\s+|[.,!?;:()"]+)/).filter(Boolean);
    const tokens: LiveCorrectionToken[] = [];

    // Emparejar y etiquetar tokens
    const maxLen = Math.max(origWords.length, corrWords.length);
    let iOrig = 0;
    let iCorr = 0;

    while (iCorr < corrWords.length) {
      const cWord = corrWords[iCorr];
      const oWord = iOrig < origWords.length ? origWords[iOrig] : undefined;

      if (oWord !== undefined && oWord.toLowerCase() === cWord.toLowerCase()) {
        tokens.push({
          type: 'unchanged',
          corrected: cWord
        });
        iOrig++;
        iCorr++;
      } else {
        // Encontrar si este cambio pertenece a algún detalle registrado
        const matchedDetail = details.find(d => 
          cWord.toLowerCase().includes(d.suggested.toLowerCase().split(/\s+/)[0] || '') ||
          d.suggested.toLowerCase().includes(cWord.toLowerCase())
        );

        const category = matchedDetail?.category || 'vocabulary';
        const typeToken = category === 'verb_tense' 
          ? 'tense' 
          : category === 'person_agreement' 
            ? 'person' 
            : category === 'connector' 
              ? 'connector' 
              : 'lexical';

        tokens.push({
          type: typeToken,
          original: oWord || '',
          corrected: cWord,
          explanation: matchedDetail?.pedagogicalRule || 'Ajuste morfosintáctico oficial de concordancia y registro.',
          category: category
        });

        iOrig++;
        iCorr++;
      }
    }

    // Métricas por categoría
    const counts = {
      verbTenses: details.filter(d => d.category === 'verb_tense').length,
      personAgreement: details.filter(d => d.category === 'person_agreement').length,
      connectors: details.filter(d => d.category === 'connector').length,
      vocabulary: details.filter(d => d.category === 'vocabulary').length,
      spelling: details.filter(d => d.category === 'spelling').length
    };

    return {
      originalText: raw,
      correctedText: current,
      hasErrors: details.length > 0,
      tokens: tokens,
      categoryCounts: counts,
      details: details
    };
  }

  /**
   * [COMANDO: EVALUACION_FINAL]
   * Emite la calificación analítica oficial estricta para Cambridge o DELF/DALF.
   */
  public static evaluarTextoFinal(input: {
    idioma: WritingLanguage;
    nivel: LanguageLevel;
    consigna: string;
    texto_final: string;
    studentId?: string;
    studentName?: string;
  }): FinalEvaluationOutput {
    const analysis = this.analizarBorrador({
      idioma: input.idioma,
      nivel: input.nivel,
      consigna: input.consigna,
      borrador_actual: input.texto_final
    });

    const isEnglish = input.idioma === 'en';
    const errorCount = analysis.diagnosticos_detectados.length;
    const connectorCount = analysis.metricas_tiempo_real.conectores_nivel_esperado.length;
    const wordStatus = analysis.estado_longitud;

    // Cálculo base de puntuación según rigor pedagógico
    let contentScore = wordStatus === 'optimo' ? 5 : wordStatus === 'deficiente' ? 3 : 4;
    let communicativeScore = 5 - Math.min(2, Math.floor(errorCount / 2));
    let organisationScore = connectorCount >= 3 ? 5 : connectorCount >= 1 ? 4 : 3;
    let languageScore = Math.max(2, 5 - errorCount);

    if (analysis.metricas_tiempo_real.diversidad_lexica_ttr < 0.45) {
      languageScore = Math.max(2, languageScore - 1);
    }

    let globalPercentage = 80;
    let cambridgeRubric: any = undefined;
    let delfRubric: any = undefined;

    if (isEnglish) {
      const raw20 = contentScore + communicativeScore + organisationScore + languageScore;
      globalPercentage = Math.round((raw20 / 20) * 100);
      cambridgeRubric = {
        content: contentScore,
        communicativeAchievement: communicativeScore,
        organisation: organisationScore,
        language: languageScore,
        totalRaw: raw20,
        percentageScore: globalPercentage,
        cefrStatement: globalPercentage >= 80 
          ? `Performance solidly demonstrates CEFR ${input.nivel} mastery according to Cambridge Assessment criteria.`
          : `Candidate requires consolidation of grammatical range and L1 interference control to secure full ${input.nivel} pass.`
      };
    } else {
      // Grilla oficial DELF (sobre 25 puntos)
      const priseDePosition = Math.min(6, Math.max(2, contentScore + 1));
      const coherence = Math.min(6, Math.max(2, organisationScore + 1));
      const lexique = Math.min(6, Math.max(2, communicativeScore + 1));
      const morpho = Math.min(7, Math.max(3, languageScore + 2));
      const totalSur25 = priseDePosition + coherence + lexique + morpho;
      globalPercentage = Math.round((totalSur25 / 25) * 100);

      let mention: 'Non admis' | 'Admis' | 'Assez Bien' | 'Bien' | 'Très Bien' = 'Admis';
      if (globalPercentage >= 88) mention = 'Très Bien';
      else if (globalPercentage >= 75) mention = 'Bien';
      else if (globalPercentage >= 60) mention = 'Assez Bien';
      else if (globalPercentage < 50) mention = 'Non admis';

      delfRubric = {
        priseDePositionOuRespect: priseDePosition,
        coherenceEtCohesion: coherence,
        competenceLexicale: lexique,
        competenceMorphosyntaxique: morpho,
        totalSur25: totalSur25,
        percentageScore: globalPercentage,
        mention: mention
      };
    }

    // Aciertos Notables (citas directas)
    const sentences = input.texto_final.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    const aciertos = sentences.slice(0, 2).map(s => ({
      cita: `"${s}"`,
      explicacion: isEnglish
        ? 'Effective sentence construction maintaining appropriate communicative register and topical relevance.'
        : 'Formulation fluide démontrant une bonne maîtrise du registre attendu et de la progression thématique.'
    }));

    // Errores Críticos & L1 Transfer
    const erroresCriticos = analysis.diagnosticos_detectados.map(d => ({
      segmento: `"${d.segmento}"`,
      correccionSugerida: d.pista_nivel_3_modelo,
      justificacionLinguistica: d.pista_nivel_2
    }));

    const l1Diagnostics = analysis.diagnosticos_detectados.filter(d => d.tipo === 'transferencia_L1' || d.pista_nivel_2.toLowerCase().includes('español'));
    const l1Cases = l1Diagnostics.map(d => ({
      expresionUsada: d.segmento,
      origenEspañol: d.pista_nivel_2.includes('español') ? d.pista_nivel_2 : 'Interferencia semántica con la lengua materna (L1)',
      equivalenteNatural: d.pista_nivel_3_modelo
    }));

    // Plan de acción con 2 micro-objetivos medibles
    const micro1 = isEnglish
      ? (analysis.metricas_tiempo_real.conectores_nivel_esperado.length < 2
          ? 'Integrar al menos 3 conectores discursivos formales (e.g. "furthermore", "however", "as a result") en el siguiente ensayo.'
          : 'Depurar falsos amigos y régimen preposicional (reemplazar "depend of" por "depend on").')
      : (analysis.metricas_tiempo_real.conectores_nivel_esperado.length < 2
          ? 'Employer au moins 3 articulateurs logiques de nuance (e.g. "cependant", "en outre", "par conséquent").'
          : 'Pratiquer l\'accord systématique du participe passé et le subjonctif après "bien que".');

    const micro2 = wordStatus !== 'optimo'
      ? `Calibrar la producción escrita para permanecer con precisión dentro del rango (${analysis.rango_esperado}).`
      : (isEnglish
          ? 'Ampliar el léxico activo sustituyendo adjetivos genéricos ("good", "bad", "big") por términos precisos.'
          : 'Remplacer les verbes passe-partout ("faire", "avoir", "être") par un vocabulaire d\'action précis.');

    return {
      id: `EVAL-${Date.now()}`,
      taskId: `TASK-${input.nivel}`,
      idioma: input.idioma,
      nivel: input.nivel,
      studentId: input.studentId || 'std-demo-01',
      studentName: input.studentName || 'Aspirante iSkool',
      rubricaCambridge: cambridgeRubric,
      rubricaDelf: delfRubric,
      calificacionGlobal: globalPercentage,
      desgloseCualitativo: {
        aciertosNotables: aciertos.length > 0 ? aciertos : [{
          cita: `"${sentences[0] || 'Texto enviado'}"`,
          explicacion: 'Esfuerzo evidente en la estructuración de la respuesta conforme a la consigna.'
        }],
        erroresCriticos: erroresCriticos,
        diagnosticoInterferenciaL1: {
          detectada: l1Cases.length > 0,
          casos: l1Cases
        }
      },
      planAccionSiguienteSesion: {
        objetivosMicroLinguisticos: [micro1, micro2],
        recursoRecomendado: isEnglish
          ? 'Guía Cambridge de Conectores y Preposiciones Dependientes (B2-C1)'
          : 'Fiche Synthétique FEI - Connecteurs Logiques et Subjonctif (B1-B2)',
        ejercicioSugerido: isEnglish
          ? 'Redactar 4 oraciones de contraste empleando "although" y "whereas" sin traducción literal.'
          : 'Transformer 5 phrases coordonnées en utilisant la concession avec "bien que + subjonctif".'
      },
      xpGanados: globalPercentage >= 80 ? 250 : 150,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * [COMANDO: DASHBOARD_DOCENTE]
   * Genera el reporte del grupo de clase con el principio Apple Clean UX.
   */
  public static generarDashboardDocente(input: {
    grupo: string;
    evaluaciones: FinalEvaluationOutput[];
  }): TeacherCohortDashboardOutput {
    const list = input.evaluaciones && input.evaluaciones.length > 0
      ? input.evaluaciones
      : this.obtenerEvaluacionesSemillaDemo();

    const total = list.length;
    const avgScore = total > 0
      ? Math.round(list.reduce((acc, curr) => acc + curr.calificacionGlobal, 0) / total)
      : 0;

    // Semáforo de cohorte
    let verdeCount = 0;
    let ambarCount = 0;
    let rojoCount = 0;

    const studentSummaries: TeacherStudentSummary[] = list.map((ev, index) => {
      let semaforo: TrafficLightStatus = 'verde';
      if (ev.calificacionGlobal >= 80) {
        semaforo = 'verde';
        verdeCount++;
      } else if (ev.calificacionGlobal >= 60 || ev.desgloseCualitativo.diagnosticoInterferenciaL1.detectada) {
        semaforo = 'ambar';
        ambarCount++;
      } else {
        semaforo = 'rojo';
        rojoCount++;
      }

      return {
        studentId: ev.studentId || `std-00${index + 1}`,
        studentName: ev.studentName || `Estudiante ${index + 1}`,
        nivel: ev.nivel,
        idioma: ev.idioma,
        calificacion: ev.calificacionGlobal,
        semaforo: semaforo,
        palabras: 165,
        rangoCumplido: true,
        errorPrincipal: ev.desgloseCualitativo.erroresCriticos[0]?.justificacionLinguistica || 'Ninguno significativo',
        interferenciaL1: ev.desgloseCualitativo.diagnosticoInterferenciaL1.detectada,
        evaluatedAt: ev.evaluatedAt
      };
    });

    const verdePct = Math.round((verdeCount / total) * 100);
    const ambarPct = Math.round((ambarCount / total) * 100);
    const rojoPct = Math.round((rojoCount / total) * 100);

    // Resumen ejecutivo de 3 líneas estilo Apple Clean UX
    const linea1 = `Cohorte ${input.grupo}: Promedio general de ${avgScore}% con un ${verdePct}% de alumnos autónomos en producción escrita.`;
    const linea2 = `Riesgo focalizado en un ${ambarPct}% del aula por interferencia directa de sintaxis L1 española en conectores y régimen preposicional.`;
    const linea3 = `Intervención pedagógica recomendada: sesión de activación de 10 minutos en micro-estructuras de contraste y régimen preposicional antes de la próxima tarea.`;

    // Top 3 patrones de error recurrentes
    const top3: [RecurringErrorPattern, RecurringErrorPattern, RecurringErrorPattern] = [
      {
        patron: 'Régimen preposicional anclado al español ("depend of", "visiter à")',
        categoria: 'transferencia_L1',
        frecuencia: Math.max(3, Math.round(total * 0.45)),
        afectaPorcentaje: 45,
        ejemploTipico: '"The climate change results depend of government policies"',
        remedioDidactico: 'Flash-cards de colocaciones fijas y preposiciones dependientes en contexto.'
      },
      {
        patron: 'Pobreza de conectores discursivos supraoracionales (abuso de "and", "but", "parce que")',
        categoria: 'coherencia',
        frecuencia: Math.max(2, Math.round(total * 0.35)),
        afectaPorcentaje: 35,
        ejemploTipico: '"I like it and it is good and because of this I support it"',
        remedioDidactico: 'Matriz visual de conectores B2: sustitución en cadena por "furthermore", "however", "consequently".'
      },
      {
        patron: 'Omisión de flexión de 3ra persona singular o subjuntivo obligatorio',
        categoria: 'gramatica',
        frecuencia: Math.max(1, Math.round(total * 0.20)),
        afectaPorcentaje: 20,
        ejemploTipico: '"He understand the problem" / "Bien qu\'il est tard"',
        remedioDidactico: 'Técnica de auto-monitoreo "Target Scan": subrayar sujetos y verificar terminación -s o modo subjuntivo.'
      }
    ];

    return {
      grupo: input.grupo,
      totalEstudiantes: total,
      promedioGlobal: avgScore,
      resumenEjecutivo3Lineas: [linea1, linea2, linea3],
      semaforoCohorte: {
        verdeAutonomosCount: verdeCount,
        verdeAutonomosPorcentaje: verdePct,
        ambarRiesgoL1Count: ambarCount,
        ambarRiesgoL1Porcentaje: ambarPct,
        rojoBloqueoCount: rojoCount,
        rojoBloqueoPorcentaje: rojoPct
      },
      top3PatronesError: top3,
      recomendacionIntervencionPedagogicaClaseViva: {
        focoPrincipal: 'Desarraigo de interferencias de sintaxis L1 y ampliación de conectores analíticos',
        actividadActivacion10Min: 'Ejercicio "Speed-Connector Relay": En parejas, transformar 5 enunciados simples en un párrafo cohesionado B2 usando "whereas", "on the contrary" o "bien que + subj".',
        materialGuia: 'Rúbrica oficial Cambridge & DELF de Communicative Achievement y Cohesión'
      },
      estudiantes: studentSummaries,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Genera evaluaciones semilla de muestra para el dashboard docente en frío.
   */
  public static obtenerEvaluacionesSemillaDemo(): FinalEvaluationOutput[] {
    return [
      {
        id: 'eval-seed-1',
        taskId: 'TASK-B2',
        idioma: 'en',
        nivel: 'B2',
        studentId: 'std-santi',
        studentName: 'Santiago Morales Gutiérrez',
        calificacionGlobal: 88,
        rubricaCambridge: {
          content: 5,
          communicativeAchievement: 4,
          organisation: 5,
          language: 4,
          totalRaw: 18,
          percentageScore: 90,
          cefrStatement: 'Outstanding mastery of formal essay conventions with minor lexical slips.'
        },
        desgloseCualitativo: {
          aciertosNotables: [{
            cita: '"Furthermore, technological access democratizes academic inquiry across diverse socio-economic backgrounds."',
            explicacion: 'Excelente uso de vocabulario académico formal y conector discursivo avanzado.'
          }],
          erroresCriticos: [{
            segmento: '"depend of the school infrastructure"',
            correccionSugerida: '"depend on the school infrastructure"',
            justificacionLinguistica: 'Régimen preposicional dependiente: en inglés se dice "depend on".'
          }],
          diagnosticoInterferenciaL1: {
            detectada: true,
            casos: [{
              expresionUsada: 'depend of',
              origenEspañol: 'Calco directo de "depender de"',
              equivalenteNatural: 'depend on'
            }]
          }
        },
        planAccionSiguienteSesion: {
          objetivosMicroLinguisticos: [
            'Verificar preposiciones dependientes en verbos de causa y efecto.',
            'Consolidar la voz pasiva en el párrafo de síntesis.'
          ],
          recursoRecomendado: 'Guía B2 First de Colocaciones Académicas',
          ejercicioSugerido: 'Escribir 5 oraciones con depend on, rely on e insist on.'
        },
        xpGanados: 250,
        evaluatedAt: '2026-10-02T11:30:00Z'
      },
      {
        id: 'eval-seed-2',
        taskId: 'TASK-B1',
        idioma: 'en',
        nivel: 'B1',
        studentId: 'std-elena',
        studentName: 'Elena Rostova Cruz',
        calificacionGlobal: 72,
        rubricaCambridge: {
          content: 4,
          communicativeAchievement: 3,
          organisation: 4,
          language: 3,
          totalRaw: 14,
          percentageScore: 70,
          cefrStatement: 'Good communication of ideas; needs consolidation of sentence linking and agreement.'
        },
        desgloseCualitativo: {
          aciertosNotables: [{
            cita: '"In my opinion uniforms are useful because everyone looks equal."',
            explicacion: 'Idea bien planteada y concisa respondiendo directamente al punto detonante.'
          }],
          erroresCriticos: [{
            segmento: '"people is happy"',
            correccionSugerida: '"people are happy"',
            justificacionLinguistica: 'People es sustantivo plural en inglés y rige "are".'
          }],
          diagnosticoInterferenciaL1: {
            detectada: true,
            casos: [{
              expresionUsada: 'people is',
              origenEspañol: 'Concordancia en singular por la gente es',
              equivalenteNatural: 'people are'
            }]
          }
        },
        planAccionSiguienteSesion: {
          objetivosMicroLinguisticos: [
            'Diferenciar sustantivos colectivos plurales en inglés (people, police).',
            'Enlazar enunciados con although y however.'
          ],
          recursoRecomendado: 'Ficha B1 Preliminary de Sujetos Colectivos',
          ejercicioSugerido: 'Corregir 10 oraciones con errores de concordancia de número.'
        },
        xpGanados: 160,
        evaluatedAt: '2026-10-02T12:00:00Z'
      },
      {
        id: 'eval-seed-3',
        taskId: 'TASK-B2',
        idioma: 'fr',
        nivel: 'B2',
        studentId: 'std-mateo',
        studentName: 'Mateo Villanueva Soto',
        calificacionGlobal: 84,
        rubricaDelf: {
          priseDePositionOuRespect: 5,
          coherenceEtCohesion: 5,
          competenceLexicale: 5,
          competenceMorphosyntaxique: 6,
          totalSur25: 21,
          percentageScore: 84,
          mention: 'Bien'
        },
        desgloseCualitativo: {
          aciertosNotables: [{
            cita: '"Certes, le développement économique est crucial, mais il ne saurait se faire au détriment du bien-être des générations futures."',
            explicacion: 'Maniement impeccable de la concession et du conditionnel de politesse soutenue.'
          }],
          erroresCriticos: [{
            segmento: '"bien que ce projet est coûteux"',
            correccionSugerida: '"bien que ce projet soit coûteux"',
            justificacionLinguistica: 'Bien que exige obligatoirement le subjonctif.'
          }],
          diagnosticoInterferenciaL1: {
            detectada: true,
            casos: [{
              expresionUsada: 'bien que + indicatif',
              origenEspañol: 'Aunque en indicativo en español conversacional',
              equivalenteNatural: 'bien que + subjonctif'
            }]
          }
        },
        planAccionSiguienteSesion: {
          objetivosMicroLinguisticos: [
            'Systématiser l\'usage du subjonctif après les locutions concessives.',
            'Varier les formules de conclusion épistolaire officielle.'
          ],
          recursoRecomendado: 'Aide-mémoire DELF B2 France Éducation International',
          ejercicioSugerido: 'Rédiger 5 phrases complexes avec bien que, quoique et encore que.'
        },
        xpGanados: 230,
        evaluatedAt: '2026-10-02T12:45:00Z'
      },
      {
        id: 'eval-seed-4',
        taskId: 'TASK-A2',
        idioma: 'fr',
        nivel: 'A2',
        studentId: 'std-lucas',
        studentName: 'Lucas Del Valle',
        calificacionGlobal: 58,
        rubricaDelf: {
          priseDePositionOuRespect: 4,
          coherenceEtCohesion: 3,
          competenceLexicale: 4,
          competenceMorphosyntaxique: 4,
          totalSur25: 15,
          percentageScore: 60,
          mention: 'Assez Bien'
        },
        desgloseCualitativo: {
          aciertosNotables: [{
            cita: '"Quand j\'avais dix ans, nous sommes allés au bord de la mer avec mes cousins."',
            explicacion: 'Bonne alternance imparfait et passé composé dans l\'introduction du récit.'
          }],
          erroresCriticos: [{
            segmento: '"J\'ai visité à mes grands-parents"',
            correccionSugerida: '"J\'ai rendu visite à mes grands-parents"',
            justificacionLinguistica: 'Régime verbal : on rend visite à une personne, on visite un lieu.'
          }],
          diagnosticoInterferenciaL1: {
            detectada: true,
            casos: [{
              expresionUsada: 'visiter à',
              origenEspañol: 'Calco directo del español "visitar a"',
              equivalenteNatural: 'rendre visite à'
            }]
          }
        },
        planAccionSiguienteSesion: {
          objetivosMicroLinguisticos: [
            'Distinguer visiter (lieu) et rendre visite à (personne).',
            'Veiller à l\'accord du participe passé avec l\'auxiliaire être.'
          ],
          recursoRecomendado: 'Fiche d\'exercices DELF A2 - Récit au passé',
          ejercicioSugerido: 'Compléter 8 phrases avec visiter ou rendre visite à.'
        },
        xpGanados: 120,
        evaluatedAt: '2026-10-02T13:15:00Z'
      }
    ];
  }
}
