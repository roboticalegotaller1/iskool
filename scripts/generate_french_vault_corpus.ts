/**
 * @file generate_french_vault_corpus.ts
 * @description Generador automatizado de la Bóveda Curricular de Francés (knowledge/french/).
 * Crea un corpus exhaustivo de nodos pedagógicos alineados a France Éducation International (DELF/DALF)
 * y a la Certificación Nacional de Nivel de Idioma (CENNI) de la SEP en México.
 */

import fs from 'fs';
import path from 'path';

interface VaultNodeDef {
  relativePath: string;
  frontmatter: Record<string, any>;
  title: string;
  sections: { title: string; content: string }[];
}

const ROOT_FR = path.join(process.cwd(), 'knowledge', 'french');

const nodes: VaultNodeDef[] = [
  // ---------------------------------------------------------------------------
  // 00_SYSTEM
  // ---------------------------------------------------------------------------
  {
    relativePath: '00_SYSTEM/README.md',
    title: 'Architecture du Référentiel Pédagogique Français iSkool',
    frontmatter: {
      id: 'fr_00_system_readme',
      title: 'Architecture du Référentiel Pédagogique Français iSkool',
      type: 'system_index',
      language: 'french',
      school_stage: ['primary', 'secondary', 'high_school', 'advanced'],
      grades: ['all'],
      cefr: ['A1', 'A2', 'B1', 'B2', 'C1'],
      delf_alignment: ['DELF Prim A1', 'DELF Junior A1', 'DELF Junior A2', 'DELF Junior B1', 'DELF Junior B2', 'DALF C1'],
      skills: ['grammar', 'vocabulary', 'listening', 'speaking', 'reading', 'writing', 'pronunciation'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024', 'cecr_volume_complementaire_2020', 'sep_cenni_mexico']
    },
    sections: [
      {
        title: '1. Vision et Mission Pédagogique',
        content: `Le référentiel pédagogique de langue française d'iSkool est structuré selon la perspective actionnelle du CECRL (Cadre européen commun de référence pour les langues). Il prépare les apprenants à l'acquisition d'une compétence communicative opérationnelle et à l'obtention des certifications officielles DELF/DALF de France Éducation International et de la certification CENNI de la SEP au Mexique.`
      },
      {
        title: '2. Structure des Dossiers',
        content: `- \`01_FRAMEWORKS/\`: Référentiels DELF/DALF et matrice de correspondance CENNI SEP.
- \`02_GRADE_MAP/\`: Cartographie d'articulation scolaire (Primaire, Secondaire, Lycée/Bachillerato).
- \`03_SKILLS/\`: Modules par compétence langagière (Grammaire, Phonétique, Compréhension, Production).
- \`04_TOPICS/\`: Domaines thématiques et actes de parole.
- \`05_PEDAGOGY/\`: Fondements méthodologiques actionnels et médiation socratique.
- \`06_ACTIVITY_PATTERNS/\`: Modèles d'activités communicatives et tâches authentiques.
- \`07_ASSESSMENT/\`: Grilles d'évaluation critériées et barèmes officiels DELF.
- \`99_SOURCES/\`: Documents cadres et sources institutionnelles.`
      }
    ]
  },
  {
    relativePath: '00_SYSTEM/french_phonetic_system_guide.md',
    title: 'Guide du Système Phonétique et Prosodique du Français',
    frontmatter: {
      id: 'fr_phonetics_system_guide',
      title: 'Guide du Système Phonétique et Prosodique du Français',
      type: 'pedagogical_guide',
      language: 'french',
      school_stage: ['secondary', 'high_school'],
      grades: ['secondary_1', 'secondary_2', 'secondary_3', 'high_school_1'],
      cefr: ['A1', 'A2', 'B1'],
      skills: ['pronunciation', 'speaking', 'listening'],
      prerequisites: [],
      related_to: ['fr_phon_nasales_intro_a1', 'fr_phon_liaisons_fondamentales_a2'],
      status: 'approved',
      version: 1,
      source_ids: ['cecr_volume_complementaire_2020']
    },
    sections: [
      {
        title: '1. Spécificités Phonologiques pour Hispanophones',
        content: `Pour les apprenants hispanophones mexicains, les défis majeurs résident dans:
1. Les voyelles nasales ([ɑ̃], [ɛ̃], [ɔ̃], [œ̃]).
2. Les voyelles antérieures arrondies ([y], [ø], [œ]).
3. Le phénomène de la liaison et de l'enchaînement vocalique/consonantique.
4. L'accent tonique final de groupe rythmique.`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 01_FRAMEWORKS
  // ---------------------------------------------------------------------------
  {
    relativePath: '01_FRAMEWORKS/delf_dalf_cecr_matrix.md',
    title: 'Matrice Officielle DELF-DALF et Niveaux CECRL',
    frontmatter: {
      id: 'fr_framework_delf_dalf_matrix',
      title: 'Matrice Officielle DELF-DALF et Niveaux CECRL',
      type: 'curriculum_framework',
      language: 'french',
      school_stage: ['primary', 'secondary', 'high_school', 'advanced'],
      grades: ['all'],
      cefr: ['A1', 'A2', 'B1', 'B2', 'C1'],
      delf_alignment: ['DELF Prim A1', 'DELF Junior A1', 'DELF Junior A2', 'DELF Junior B1', 'DELF Junior B2', 'DALF C1'],
      skills: ['listening', 'speaking', 'reading', 'writing'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Épreuves et Pondération DELF (Sur 100 points)',
        content: `Chaque examen DELF (A1, A2, B1, B2) est composé de 4 épreuves valant 25 points chacune:
- Compréhension de l'oral (CO) : 25 points
- Compréhension des écrits (CE) : 25 points
- Production écrite (PE) : 25 points
- Production orale (PO) : 25 points
Seuil de réussite: 50/100, avec une note minimale éliminatoire de 5/25 par épreuve.`
      }
    ]
  },
  {
    relativePath: '01_FRAMEWORKS/sep_cenni_mexico_equivalence.md',
    title: 'Cadre de Correspondance SEP CENNI pour la Langue Française au Mexique',
    frontmatter: {
      id: 'fr_framework_cenni_sep_matrix',
      title: 'Cadre de Correspondance SEP CENNI pour la Langue Française au Mexique',
      type: 'curriculum_framework',
      language: 'french',
      school_stage: ['secondary', 'high_school', 'advanced'],
      grades: ['all'],
      cefr: ['A1', 'A2', 'B1', 'B2', 'C1'],
      cenni_alignment: ['CENNI Nivel 5-7 (A1)', 'CENNI Nivel 8-10 (A2)', 'CENNI Nivel 11-13 (B1)', 'CENNI Nivel 14-16 (B2)', 'CENNI Nivel 17-19 (C1)'],
      skills: ['listening', 'speaking', 'reading', 'writing'],
      status: 'approved',
      version: 1,
      source_ids: ['sep_cenni_mexico', 'dgb_sep_frances_2024']
    },
    sections: [
      {
        title: '1. Équivalences Officielles SEP CENNI / DELF',
        content: `Au Mexique, la Direction Générale de l'Accréditation, de l'Incorporation et de la Révalidation (DGAIR) de la SEP établit les correspondances suivantes:
- DELF A1 certifie le niveau CENNI 5 à 7.
- DELF A2 certifie le niveau CENNI 8 à 10 (Seuil requis en fin de Secondaire / Secundaria).
- DELF B1 certifie le niveau CENNI 11 à 13 (Profil cible Bachillerato / Preparatoria).
- DELF B2 certifie le niveau CENNI 14 à 16 (Exigence d'accès universitaire international et bilingue).
- DALF C1 certifie le niveau CENNI 17 à 19 (Maîtrise professionnelle et académique supérieure).`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 02_GRADE_MAP
  // ---------------------------------------------------------------------------
  {
    relativePath: '02_GRADE_MAP/secondary_grade_map_french.md',
    title: 'Cartographie Curriculaire Secondaire (Secundaria) - Français Débutant A1 vers A2',
    frontmatter: {
      id: 'fr_grade_map_secondary',
      title: 'Cartographie Curriculaire Secondaire (Secundaria) - Français Débutant A1 vers A2',
      type: 'grade_map',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_1', 'secondary_2', 'secondary_3'],
      cefr: ['A1', 'A2'],
      delf_alignment: ['DELF Junior A1', 'DELF Junior A2'],
      skills: ['listening', 'speaking', 'reading', 'writing', 'grammar'],
      status: 'approved',
      version: 1,
      source_ids: ['sep_nem_lenguajes_2024', 'france_education_international_2024']
    },
    sections: [
      {
        title: '1. Objectifs de Cycle Secondaire',
        content: `- Secondaire 1: Découverte phonologique, salutations, se présenter, univers de l'école (A1.1).
- Secondaire 2: Vie quotidienne, famille, loisirs, passé composé de base (A1 vers A2).
- Secondaire 3: Consolidation A2 (DELF Junior A2 / CENNI 9-10). Raconter un voyage, exprimer des projets.`
      }
    ]
  },
  {
    relativePath: '02_GRADE_MAP/high_school_grade_map_french.md',
    title: 'Cartographie Curriculaire Lycée / Bachillerato - Français B1 vers B2',
    frontmatter: {
      id: 'fr_grade_map_high_school',
      title: 'Cartographie Curriculaire Lycée / Bachillerato - Français B1 vers B2',
      type: 'grade_map',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1', 'high_school_2', 'high_school_3'],
      cefr: ['B1', 'B2'],
      delf_alignment: ['DELF Junior B1', 'DELF Junior B2', 'DELF Tout Public B1', 'DELF Tout Public B2'],
      skills: ['listening', 'speaking', 'reading', 'writing', 'grammar'],
      status: 'approved',
      version: 1,
      source_ids: ['dgb_sep_frances_2024', 'france_education_international_2024']
    },
    sections: [
      {
        title: '1. Objectifs de Cycle Bachillerato (Lycée)',
        content: `- Lycée 1 (40 semaines) : Consolidation B1 et amorce B2 (DELF B1 / CENNI 12-13). Argumentation simple, compte-rendu, lettre formelle.
- Lycée 2-3 : Maîtrise B2 complète (DELF B2 / CENNI 15-16). Débat citoyen, analyse de presse, synthèse documentaire.`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 03_SKILLS - GRAMMAIRE (Progression A1 -> B2)
  // ---------------------------------------------------------------------------
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_present_indicatif_a1.md',
    title: 'Le Présent de l\'Indicatif des Verbes Réguliers et Usuels',
    frontmatter: {
      id: 'fr_gram_present_indicatif_a1',
      title: 'Le Présent de l\'Indicatif des Verbes Réguliers et Usuels',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['secondary', 'primary'],
      grades: ['secondary_1'],
      cefr: ['A1'],
      delf_alignment: ['DELF Prim A1', 'DELF Junior A1'],
      skills: ['grammar', 'writing', 'speaking'],
      grammar: ['present_indicative', 'verbes_1er_groupe', 'etre_avoir'],
      difficulty: 'beginner',
      duration_minutes: 45,
      prerequisites: [],
      related_to: ['fr_gram_articles_definis_indefinis_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Descripteur Can-Do CECRL (A1)',
        content: `L'apprenant peut conjuguer au présent de l'indicatif les auxiliaires [[être]] et [[avoir]], les verbes réguliers en -er (parler, habiter, aimer) et les verbes fréquents (faire, aller) pour décrire son identité et ses actions immédiates.`
      },
      {
        title: '2. Règles Morphologiques',
        content: `Terminaisons des verbes en -er: -e, -es, -e, -ons, -ez, -ent (rappel: les terminaisons -e, -es, -ent sont muettes en prononciation).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_articles_definis_indefinis_a1.md',
    title: 'Les Articles Définis, Indéfinis et Partitifs',
    frontmatter: {
      id: 'fr_gram_articles_definis_indefinis_a1',
      title: 'Les Articles Définis, Indéfinis et Partitifs',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_1'],
      cefr: ['A1'],
      skills: ['grammar', 'writing'],
      grammar: ['articles_definis', 'articles_indefinis', 'articles_partitifs'],
      prerequisites: [],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Usage Communicatif',
        content: `Différencier la désignation générale (le, la, les), l'unité dénombrable (un, une, des) et la quantité non comptable (du, de la, de l', des).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_negation_simple_complexe_a2.md',
    title: 'La Négation en Français : de Ne... Pas à Ne... Plus, Jamais, Rien',
    frontmatter: {
      id: 'fr_gram_negation_simple_complexe_a2',
      title: 'La Négation en Français : de Ne... Pas à Ne... Plus, Jamais, Rien',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_2'],
      cefr: ['A2'],
      delf_alignment: ['DELF Junior A2'],
      skills: ['grammar', 'speaking', 'writing'],
      prerequisites: ['fr_gram_present_indicatif_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Évolution de la Structure Négative',
        content: `À partir du niveau A2, l'élève maîtrise l'encadrement verbal : *ne + verbe + pas/plus/jamais/rien/personne*. Attention à la disparition de l'article partitif au profit de *de* (Je ne mange pas de viande).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_passe_compose_vs_imparfait_a2_b1.md',
    title: 'L\'Alternance Passé Composé vs Imparfait dans le Récit',
    frontmatter: {
      id: 'fr_gram_passe_compose_vs_imparfait_a2_b1',
      title: 'L\'Alternance Passé Composé vs Imparfait dans le Récit',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['secondary', 'high_school'],
      grades: ['secondary_3', 'high_school_1'],
      cefr: ['A2', 'B1'],
      delf_alignment: ['DELF Junior A2', 'DELF Junior B1'],
      skills: ['grammar', 'writing', 'reading'],
      grammar: ['passe_compose', 'imparfait', 'narration_passe'],
      prerequisites: ['fr_gram_present_indicatif_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024', 'dgb_sep_frances_2024']
    },
    sections: [
      {
        title: '1. Règle Majeure de la Narration au Passé',
        content: `- **L'imparfait** peint le décor, les descriptions, les états d'esprit et les actions habituelles ou en cours.
- **Le passé composé** marque la rupture, les événements ponctuels, délimités et successifs qui font progresser l'histoire.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_pronoms_cod_coi_y_en_b1.md',
    title: 'Le Système des Pronoms Personnels et Adverbiaux : COD, COI, Y et EN',
    frontmatter: {
      id: 'fr_gram_pronoms_cod_coi_y_en_b1',
      title: 'Le Système des Pronoms Personnels et Adverbiaux : COD, COI, Y et EN',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1'],
      delf_alignment: ['DELF Junior B1', 'DELF Tout Public B1'],
      skills: ['grammar', 'speaking', 'writing'],
      prerequisites: ['fr_gram_passe_compose_vs_imparfait_a2_b1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Règles de Remplacement et d\'Ordre des Pronoms',
        content: `- COD (le, la, les) remplace un nom direct d'objet ou de personne.
- COI (lui, leur) remplace un nom de personne introduit par *à*.
- Y remplace un lieu ou une chose introduite par *à, en, sur, dans*.
- EN remplace une quantité, un partitif ou un nom introduit par *de*.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_futur_simple_et_conditionnel_b1.md',
    title: 'Futur Simple et Conditionnel Présent : Projets et Politesse',
    frontmatter: {
      id: 'fr_gram_futur_simple_et_conditionnel_b1',
      title: 'Futur Simple et Conditionnel Présent : Projets et Politesse',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1'],
      delf_alignment: ['DELF Junior B1'],
      skills: ['grammar', 'speaking', 'writing'],
      prerequisites: ['fr_gram_present_indicatif_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Valeurs Modales',
        content: `- Futur simple : engagement, programme, prédiction avec certitude.
- Conditionnel présent : atténuation de politesse (*Je voudrais...*), conseil (*Tu devrais...*), souhait (*J'aimerais visiter...*).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_subjonctif_present_b1_b2.md',
    title: 'Le Subjonctif Présent : Expression de l\'Obligation, du Sentiment et du Doute',
    frontmatter: {
      id: 'fr_gram_subjonctif_present_b1_b2',
      title: 'Le Subjonctif Présent : Expression de l\'Obligation, du Sentiment et du Doute',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1', 'high_school_2'],
      cefr: ['B1', 'B2'],
      delf_alignment: ['DELF Junior B1', 'DELF Junior B2', 'DELF Tout Public B2'],
      skills: ['grammar', 'writing', 'speaking'],
      prerequisites: ['fr_gram_futur_simple_et_conditionnel_b1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024', 'dgb_sep_frances_2024']
    },
    sections: [
      {
        title: '1. Déclencheurs Subjonctifs Clés',
        content: `Obligation impersonnelle (*Il faut que...*), volonté (*Je veux que...*), sentiment (*Je suis heureux que...*), doute (*Je doute que...*).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_hypothese_si_b1_b2.md',
    title: 'Le Système des Hypothèses avec SI : Réel, Potentiel et Irréel du Présent',
    frontmatter: {
      id: 'fr_gram_hypothese_si_b1_b2',
      title: 'Le Système des Hypothèses avec SI : Réel, Potentiel et Irréel du Présent',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1', 'high_school_2'],
      cefr: ['B1', 'B2'],
      delf_alignment: ['DELF Junior B1', 'DELF Junior B2'],
      skills: ['grammar', 'writing', 'speaking'],
      prerequisites: ['fr_gram_futur_simple_et_conditionnel_b1', 'fr_gram_passe_compose_vs_imparfait_a2_b1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Structures Canoniques',
        content: `1. Si + présent -> futur simple (certitude/réalité).
2. Si + imparfait -> conditionnel présent (hypothèse imaginaire ou conseil).
3. Si + plus-que-parfait -> conditionnel passé (regret sur le passé).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Grammaire/fr_gram_connecteurs_logiques_argumentation_b2.md',
    title: 'Connecteurs Logiques et Articulateurs du Discours Argumentatif',
    frontmatter: {
      id: 'fr_gram_connecteurs_logiques_argumentation_b2',
      title: 'Connecteurs Logiques et Articulateurs du Discours Argumentatif',
      type: 'grammar_rule',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1', 'high_school_2', 'high_school_3'],
      cefr: ['B2', 'C1'],
      delf_alignment: ['DELF Junior B2', 'DELF Tout Public B2', 'DALF C1'],
      skills: ['grammar', 'writing', 'speaking'],
      prerequisites: ['fr_gram_subjonctif_present_b1_b2'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Typologie des Articulateurs B2',
        content: `Cause (*En raison de, étant donné que*), Conséquence (*Par conséquent, d'où*), Opposition/Concession (*Cependant, bien que + subj, malgré*), But (*Afin que + subj, en vue de*).`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 03_SKILLS - COMPRÉHENSION ORALE (CO)
  // ---------------------------------------------------------------------------
  {
    relativePath: '03_SKILLS/ComprehensionOrale/fr_co_annonces_instructions_courtes_a1.md',
    title: 'Compréhension Orale : Annonces Publiques et Instructions Courtes',
    frontmatter: {
      id: 'fr_co_annonces_instructions_courtes_a1',
      title: 'Compréhension Orale : Annonces Publiques et Instructions Courtes',
      type: 'receptive_skill',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_1'],
      cefr: ['A1'],
      delf_alignment: ['DELF Junior A1'],
      skills: ['listening'],
      prerequisites: [],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Descripteur de Compétence',
        content: `Comprendre des messages simples et des instructions courantes (gares, aéroports, magasins, école) énoncés lentement et distinctement.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ComprehensionOrale/fr_co_dialogues_quotidiens_a2.md',
    title: 'Compréhension Orale : Échanges Quotidiens et Situations Pratiques',
    frontmatter: {
      id: 'fr_co_dialogues_quotidiens_a2',
      title: 'Compréhension Orale : Échanges Quotidiens et Situations Pratiques',
      type: 'receptive_skill',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_2', 'secondary_3'],
      cefr: ['A2'],
      delf_alignment: ['DELF Junior A2'],
      skills: ['listening'],
      prerequisites: ['fr_co_annonces_instructions_courtes_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Objectif DELF A2',
        content: `Identifier le sujet d'une conversation entre locuteurs natifs portant sur la vie quotidienne (achats, rendez-vous, transports).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ComprehensionOrale/fr_co_emissions_radio_points_de_vue_b1.md',
    title: 'Compréhension Orale : Extraits Radiophoniques et Prises de Position',
    frontmatter: {
      id: 'fr_co_emissions_radio_points_de_vue_b1',
      title: 'Compréhension Orale : Extraits Radiophoniques et Prises de Position',
      type: 'receptive_skill',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1'],
      delf_alignment: ['DELF Junior B1', 'DELF Tout Public B1'],
      skills: ['listening'],
      prerequisites: ['fr_co_dialogues_quotidiens_a2'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Objectif DELF B1',
        content: `Comprendre les points principaux d'une intervention radiophonique standard (bulletins d'information, interviews) sur des sujets familiers ou d'actualité.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ComprehensionOrale/fr_co_conferences_debats_nuances_b2.md',
    title: 'Compréhension Orale : Débats d\'Idées, Conférences et Nuances d\'Opinion',
    frontmatter: {
      id: 'fr_co_conferences_debats_nuances_b2',
      title: 'Compréhension Orale : Débats d\'Idées, Conférences et Nuances d\'Opinion',
      type: 'receptive_skill',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1', 'high_school_2'],
      cefr: ['B2'],
      delf_alignment: ['DELF Junior B2', 'DELF Tout Public B2'],
      skills: ['listening'],
      prerequisites: ['fr_co_emissions_radio_points_de_vue_b1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Objectif DELF B2',
        content: `Suivre une argumentation complexe, identifier les attitudes implicites des intervenants, l'humour, l'ironie et les prises de position divergentes.`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 03_SKILLS - PRODUCTION ORALE (PO)
  // ---------------------------------------------------------------------------
  {
    relativePath: '03_SKILLS/ProductionOrale/fr_po_presentation_personnelle_a1.md',
    title: 'Production Orale : Se Présenter et Parler de son Environnement Immédiat',
    frontmatter: {
      id: 'fr_po_presentation_personnelle_a1',
      title: 'Production Orale : Se Présenter et Parler de son Environnement Immédiat',
      type: 'productive_skill',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_1'],
      cefr: ['A1'],
      delf_alignment: ['DELF Junior A1'],
      skills: ['speaking'],
      prerequisites: ['fr_gram_present_indicatif_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Épreuve DELF A1',
        content: `Entretien dirigé (1 min) : Nom, âge, nationalité, profession/études, goûts, famille.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ProductionOrale/fr_po_monologue_suivi_dialogue_simule_a2.md',
    title: 'Production Orale : Monologue Suivi et Échange d\'Informations Pratiques',
    frontmatter: {
      id: 'fr_po_monologue_suivi_dialogue_simule_a2',
      title: 'Production Orale : Monologue Suivi et Échange d\'Informations Pratiques',
      type: 'productive_skill',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_2', 'secondary_3'],
      cefr: ['A2'],
      delf_alignment: ['DELF Junior A2'],
      skills: ['speaking'],
      prerequisites: ['fr_po_presentation_personnelle_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Épreuve DELF A2',
        content: `Monologue continu (2 min) sur un thème tiré au sort et jeu de rôle en interaction transactionnelle.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ProductionOrale/fr_po_expression_point_de_vue_debat_b1.md',
    title: 'Production Orale : Donner son Avis et Réagir dans une Discussion',
    frontmatter: {
      id: 'fr_po_expression_point_de_vue_debat_b1',
      title: 'Production Orale : Donner son Avis et Réagir dans une Discussion',
      type: 'productive_skill',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1'],
      delf_alignment: ['DELF Junior B1', 'DELF Tout Public B1'],
      skills: ['speaking'],
      prerequisites: ['fr_po_monologue_suivi_dialogue_simule_a2', 'fr_gram_futur_simple_et_conditionnel_b1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Épreuve DELF B1',
        content: `Expression d'un point de vue argumenté à partir d'un document déclencheur court, suivi d'un débat avec l'examinateur.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ProductionOrale/fr_po_expose_argumente_defense_b2.md',
    title: 'Production Orale : Exposé Argumenté Structuré et Défense d\'un Point de Vue',
    frontmatter: {
      id: 'fr_po_expose_argumente_defense_b2',
      title: 'Production Orale : Exposé Argumenté Structuré et Défense d\'un Point de Vue',
      type: 'productive_skill',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1', 'high_school_2'],
      cefr: ['B2'],
      delf_alignment: ['DELF Junior B2', 'DELF Tout Public B2'],
      skills: ['speaking'],
      prerequisites: ['fr_po_expression_point_de_vue_debat_b1', 'fr_gram_connecteurs_logiques_argumentation_b2'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024', 'dgb_sep_frances_2024']
    },
    sections: [
      {
        title: '1. Épreuve DELF B2',
        content: `Présentation d'une problématique dégagée d'un document déclencheur, structurée en introduction, plan équilibré, arguments illustrés et conclusion, suivie d'un débat contradictoire soutenu (20 min).`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 03_SKILLS - COMPRÉHENSION ÉCRITE (CE)
  // ---------------------------------------------------------------------------
  {
    relativePath: '03_SKILLS/ComprehensionEcrite/fr_ce_textes_pratiques_courriers_a1_a2.md',
    title: 'Compréhension Écrite : Textes Informatifs Simples, Menus et Horaires',
    frontmatter: {
      id: 'fr_ce_textes_pratiques_courriers_a1_a2',
      title: 'Compréhension Écrite : Textes Informatifs Simples, Menus et Horaires',
      type: 'receptive_skill',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_1', 'secondary_2'],
      cefr: ['A1', 'A2'],
      delf_alignment: ['DELF Junior A1', 'DELF Junior A2'],
      skills: ['reading'],
      prerequisites: [],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Descripteur CE A1/A2',
        content: `Repérer des données précises (heures, dates, prix, lieux) dans des documents de la vie quotidienne.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ComprehensionEcrite/fr_ce_presse_articles_opinions_b1_b2.md',
    title: 'Compréhension Écrite : Articles de Presse, Éditoriaux et Textes d\'Opinion',
    frontmatter: {
      id: 'fr_ce_presse_articles_opinions_b1_b2',
      title: 'Compréhension Écrite : Articles de Presse, Éditoriaux et Textes d\'Opinion',
      type: 'receptive_skill',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1', 'B2'],
      delf_alignment: ['DELF Junior B1', 'DELF Junior B2'],
      skills: ['reading'],
      prerequisites: ['fr_ce_textes_pratiques_courriers_a1_a2'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Descripteur CE B1/B2',
        content: `Dégager la thèse de l'auteur, les arguments en faveur ou défaveur, et distinguer fait objectif et point de vue subjectif.`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 03_SKILLS - PRODUCTION ÉCRITE (PE)
  // ---------------------------------------------------------------------------
  {
    relativePath: '03_SKILLS/ProductionEcrite/fr_pe_courriel_amical_invitation_a2.md',
    title: 'Production Écrite : Courriel Informel, Récit de Vacances et Invitation',
    frontmatter: {
      id: 'fr_pe_courriel_amical_invitation_a2',
      title: 'Production Écrite : Courriel Informel, Récit de Vacances et Invitation',
      type: 'productive_skill',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_2', 'secondary_3'],
      cefr: ['A2'],
      delf_alignment: ['DELF Junior A2'],
      skills: ['writing'],
      prerequisites: ['fr_gram_passe_compose_vs_imparfait_a2_b1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Épreuve DELF A2 (60 à 80 mots)',
        content: `Rédiger une lettre amicale ou un courriel pour raconter un événement récent, exprimer des remerciements ou formuler une proposition.`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/ProductionEcrite/fr_pe_essai_argumentatif_lettre_formelle_b1_b2.md',
    title: 'Production Écrite : Essai Argumentatif et Lettre de Réclamation Formelle',
    frontmatter: {
      id: 'fr_pe_essai_argumentatif_lettre_formelle_b1_b2',
      title: 'Production Écrite : Essai Argumentatif et Lettre de Réclamation Formelle',
      type: 'productive_skill',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1', 'B2'],
      delf_alignment: ['DELF Junior B1', 'DELF Junior B2', 'DELF Tout Public B2'],
      skills: ['writing'],
      prerequisites: ['fr_pe_courriel_amical_invitation_a2', 'fr_gram_connecteurs_logiques_argumentation_b2'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024', 'dgb_sep_frances_2024']
    },
    sections: [
      {
        title: '1. Épreuves Clés DELF B1 / B2',
        content: `- DELF B1 (160 mots min) : Exprimer son point de vue sur un forum citoyen ou lettre à un responsable municipal.
- DELF B2 (250 mots min) : Lettre formelle argumentée ou contribution construite défendant une position équilibrée face à une autorité.`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 03_SKILLS - PHONÉTIQUE
  // ---------------------------------------------------------------------------
  {
    relativePath: '03_SKILLS/Phonetique/fr_phon_nasales_intro_a1.md',
    title: 'Les Voyelles Nasales Françaises [ɑ̃], [ɛ̃], [ɔ̃] et [œ̃]',
    frontmatter: {
      id: 'fr_phon_nasales_intro_a1',
      title: 'Les Voyelles Nasales Françaises [ɑ̃], [ɛ̃], [ɔ̃] et [œ̃]',
      type: 'phonetics_rule',
      language: 'french',
      school_stage: ['secondary', 'primary'],
      grades: ['secondary_1'],
      cefr: ['A1'],
      skills: ['pronunciation', 'speaking', 'listening'],
      prerequisites: [],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Différenciation Auditive et Articulatoire',
        content: `Entraîner le passage de l'air par les fosses nasales sans occlusion consonantique finale (ex: *bon* vs *bonne*, *vent* vs *vanne*).`
      }
    ]
  },
  {
    relativePath: '03_SKILLS/Phonetique/fr_phon_liaisons_fondamentales_a2.md',
    title: 'Le Phénomène de la Liaison : Obligatoire, Facultative et Interdite',
    frontmatter: {
      id: 'fr_phon_liaisons_fondamentales_a2',
      title: 'Le Phénomène de la Liaison : Obligatoire, Facultative et Interdite',
      type: 'phonetics_rule',
      language: 'french',
      school_stage: ['secondary', 'high_school'],
      grades: ['secondary_2', 'high_school_1'],
      cefr: ['A2', 'B1'],
      skills: ['pronunciation', 'speaking', 'listening'],
      prerequisites: ['fr_phon_nasales_intro_a1'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Règles Cardinales de la Liaison',
        content: `- **Liaisons obligatoires :** Déterminant + Nom (*les_amis*), Pronom + Verbe (*ils_ont*), Adjectif + Nom (*un grand_arbre*).
- **Liaisons interdites :** Après *et* (*et / alors*), Nom singulier + Adjectif (*un enfant / intelligent*), avant *h aspiré* (*les / héros*).`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 04_TOPICS (Thématiques DELF A1 à B2)
  // ---------------------------------------------------------------------------
  {
    relativePath: '04_TOPICS/fr_topic_identite_diversite_a1_a2.md',
    title: 'Identité, Famille, Relations Sociales et Diversité Culturelle',
    frontmatter: {
      id: 'fr_topic_identite_diversite_a1_a2',
      title: 'Identité, Famille, Relations Sociales et Diversité Culturelle',
      type: 'thematic_module',
      language: 'french',
      school_stage: ['secondary'],
      grades: ['secondary_1', 'secondary_2'],
      cefr: ['A1', 'A2'],
      skills: ['vocabulary', 'speaking', 'writing'],
      topics: ['identity', 'family', 'daily_life'],
      prerequisites: [],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Champs Lexicaux et Actes de Parole',
        content: `Lexique des liens de parenté, des traits de caractère, des émotions et des salutations formelles et informelles en milieu francophone.`
      }
    ]
  },
  {
    relativePath: '04_TOPICS/fr_topic_ecologie_developpement_durable_b1_b2.md',
    title: 'Environnement, Transition Écologique et Développement Durable',
    frontmatter: {
      id: 'fr_topic_ecologie_developpement_durable_b1_b2',
      title: 'Environnement, Transition Écologique et Développement Durable',
      type: 'thematic_module',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1', 'B2'],
      skills: ['vocabulary', 'reading', 'speaking', 'writing'],
      topics: ['environment', 'ecology', 'sustainability'],
      prerequisites: ['fr_topic_identite_diversite_a1_a2'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024', 'dgb_sep_frances_2024']
    },
    sections: [
      {
        title: '1. Thématique Centrale des Examens DELF B1/B2',
        content: `L'écologie urbaine, les énergies renouvelables, la gestion des déchets, les circuits courts et l'empreinte carbone représentent plus de 30% des sujets d'évaluation au DELF.`
      }
    ]
  },
  {
    relativePath: '04_TOPICS/fr_topic_monde_du_travail_et_carrieres_b1_b2.md',
    title: 'Monde Professionnel, Études Supérieures et Nouvelles Carrières',
    frontmatter: {
      id: 'fr_topic_monde_du_travail_et_carrieres_b1_b2',
      title: 'Monde Professionnel, Études Supérieures et Nouvelles Carrières',
      type: 'thematic_module',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1', 'high_school_2'],
      cefr: ['B1', 'B2'],
      skills: ['vocabulary', 'writing', 'speaking'],
      topics: ['work', 'careers', 'education'],
      prerequisites: [],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Objectifs de Mobilité Académique',
        content: `Rédaction de CV en format français, lettre de motivation pour universités francophones (Campus France) et simulation d'entretien d'embauche.`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 05_PEDAGOGY
  // ---------------------------------------------------------------------------
  {
    relativePath: '05_PEDAGOGY/perspective_actionnelle_cecr.md',
    title: 'La Perspective Actionnelle et la Pédagogie par Tâches dans iSkool',
    frontmatter: {
      id: 'fr_pedagogy_perspective_actionnelle',
      title: 'La Perspective Actionnelle et la Pédagogie par Tâches dans iSkool',
      type: 'pedagogical_model',
      language: 'french',
      school_stage: ['all'],
      grades: ['all'],
      cefr: ['A1', 'A2', 'B1', 'B2', 'C1'],
      skills: ['speaking', 'writing', 'listening', 'reading'],
      status: 'approved',
      version: 1,
      source_ids: ['cecr_volume_complementaire_2020']
    },
    sections: [
      {
        title: '1. Principes Clés',
        content: `L'apprenant est considéré comme un acteur social accomplissant des tâches authentiques en interaction avec son milieu. L'évaluation porte sur l'efficacité communicative et la réussite de l'action.`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 06_ACTIVITY_PATTERNS
  // ---------------------------------------------------------------------------
  {
    relativePath: '06_ACTIVITY_PATTERNS/fr_pattern_simulation_globale_tache_delf.md',
    title: 'Modèle d\'Activité : Simulation Globale et Tâche Communicative DELF',
    frontmatter: {
      id: 'fr_pattern_simulation_delf',
      title: 'Modèle d\'Activité : Simulation Globale et Tâche Communicative DELF',
      type: 'activity_pattern',
      language: 'french',
      school_stage: ['secondary', 'high_school'],
      grades: ['all'],
      cefr: ['A1', 'A2', 'B1', 'B2'],
      skills: ['speaking', 'writing', 'listening', 'reading'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Déroulement Pédagogique en 4 Phases',
        content: `1. Mise en situation et écoute/lecture déclencheuse.
2. Conceptualisation grammaticale et lexicale inductrice.
3. Entraînement guidé avec rétroaction formative immédiate.
4. Production finale en autonomie (Tâche DELF chronométrée).`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 07_ASSESSMENT
  // ---------------------------------------------------------------------------
  {
    relativePath: '07_ASSESSMENT/grilles_officielles_delf_b1_b2.md',
    title: 'Grilles Officielles et Critères d\'Évaluation DELF B1 et B2',
    frontmatter: {
      id: 'fr_assessment_grilles_delf_b1_b2',
      title: 'Grilles Officielles et Critères d\'Évaluation DELF B1 et B2',
      type: 'assessment_rubric',
      language: 'french',
      school_stage: ['high_school'],
      grades: ['high_school_1'],
      cefr: ['B1', 'B2'],
      delf_alignment: ['DELF Junior B1', 'DELF Junior B2', 'DELF Tout Public B2'],
      skills: ['speaking', 'writing'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024']
    },
    sections: [
      {
        title: '1. Critères de la Production Écrite (DELF B2)',
        content: `- Respect de la consigne et de la longueur : 0 à 2 pts
- Capacité à argumenter et justifier un point de vue : 0 à 3 pts
- Cohérence et cohésion (articulateurs, paragraphes) : 0 à 4 pts
- Compétence lexicale (étendue et précision) : 0 à 4 pts
- Compétence morphosyntaxique (structures complexes, modes) : 0 à 5 pts
- Maîtrise de l'orthographe lexicale et grammaticale : 0 à 3 pts
- Adaptation au registre de langue formel : 0 à 4 pts`
      }
    ]
  },

  // ---------------------------------------------------------------------------
  // 99_SOURCES
  // ---------------------------------------------------------------------------
  {
    relativePath: '99_SOURCES/references_officielles_francais.md',
    title: 'Références Officielles de l\'Enseignement du Français Langue Étrangère',
    frontmatter: {
      id: 'fr_sources_references_officielles',
      title: 'Références Officielles de l\'Enseignement du Français Langue Étrangère',
      type: 'source_index',
      language: 'french',
      school_stage: ['all'],
      grades: ['all'],
      cefr: ['A1', 'A2', 'B1', 'B2', 'C1'],
      skills: ['grammar', 'vocabulary', 'listening', 'speaking', 'reading', 'writing'],
      status: 'approved',
      version: 1,
      source_ids: ['france_education_international_2024', 'cecr_volume_complementaire_2020', 'sep_cenni_mexico']
    },
    sections: [
      {
        title: '1. Organismes Certificateurs',
        content: `- France Éducation International (FEI) - Ministère de l'Éducation Nationale (France).
- Cadre européen commun de référence pour les langues (Conseil de l'Europe, Strasbourg).
- Secretaría de Educación Pública (SEP) - Certificación Nacional de Nivel de Idioma (CENNI, México).
- Institut Français d'Amérique Latine (IFAL / Ambassade de France au Mexique).`
      }
    ]
  }
];

export function generateFrenchCorpus(): void {
  console.log(`🚀 Génération du corpus de la Bóveda Curricular de Français dans ${ROOT_FR}...`);
  let count = 0;

  for (const node of nodes) {
    const fullPath = path.join(ROOT_FR, node.relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Générer frontmatter YAML
    const fmKeys = Object.keys(node.frontmatter);
    const ymlLines: string[] = ['---'];
    for (const k of fmKeys) {
      const v = node.frontmatter[k];
      if (Array.isArray(v)) {
        ymlLines.push(`${k}:`);
        for (const item of v) {
          ymlLines.push(`  - ${item}`);
        }
      } else if (typeof v === 'string') {
        ymlLines.push(`${k}: ${v}`);
      } else {
        ymlLines.push(`${k}: ${JSON.stringify(v)}`);
      }
    }
    ymlLines.push('---');

    const bodyLines: string[] = [ymlLines.join('\n'), '', `# ${node.title}`, ''];
    for (const s of node.sections) {
      bodyLines.push(`## ${s.title}`);
      bodyLines.push(s.content);
      bodyLines.push('');
    }

    fs.writeFileSync(fullPath, bodyLines.join('\n'), 'utf8');
    count++;
    console.log(`  ✓ Créé: ${node.relativePath} [${node.frontmatter.id}]`);
  }

  console.log(`\n🎉 Corpus créé avec succès! Total de nœuds pédagogiques français: ${count}`);
}

// Exécution directe
generateFrenchCorpus();
