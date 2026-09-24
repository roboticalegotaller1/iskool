/**
 * @file unitPlanner.ts
 * @description Planificador de Unidades Curriculares (CoursePlanning::UnitPlanner).
 * Recibe el perfil del curso, semanas disponibles, metas pedagógicas y prerrequisitos del Grafo,
 * y genera una propuesta estructurada de unidades que agrupan coherentemente competencias comunicativas.
 */

import { CourseEntity, UnitEntity } from './types';

export interface UnitPlannerOptions {
  numberOfUnits?: number;
  weeksPerUnit?: number;
}

export class UnitPlanner {
  /**
   * Genera la secuencia estructurada de unidades para un curso dado.
   */
  static planUnits(course: CourseEntity, options: UnitPlannerOptions = {}): UnitEntity[] {
    const totalWeeks = course.total_weeks || 40;
    const numUnits = options.numberOfUnits || 8;
    const weeksPerUnit = options.weeksPerUnit || Math.floor(totalWeeks / numUnits);

    if (course.subject === 'french') {
      return this.planFrenchUnits(course, numUnits, weeksPerUnit);
    }

    if (course.grade === 'high_school_1') {
      return this.planHighSchool1Units(course, numUnits, weeksPerUnit);
    }

    // Generador genérico para otros grados escolares si se requiere en el futuro
    return this.planGenericUnits(course, numUnits, weeksPerUnit);
  }

  /**
   * Planificación especializada para High School 1 (B1 → B1+/B2) derivada del Grade Map oficial.
   */
  private static planHighSchool1Units(course: CourseEntity, numUnits: number, weeksPerUnit: number): UnitEntity[] {
    const unitsData: Partial<UnitEntity>[] = [
      {
        position: 1,
        title: 'Identity, Relationships & Empathy',
        theme: 'identity_and_relationships',
        skills: ['speaking', 'reading', 'listening', 'vocabulary'],
        knowledge_targets: [
          'speaking_b1_b2_collaborative_discussion',
          'HS1_Reading_Inference_Author_Purpose',
          'HS1_Reading_Gist_Scanning',
          'listening_b1_b2_main_ideas',
          'grammar_b1_b2_discourse_connectors',
          'func_expressing_probability'
        ],
        learning_outcomes: [
          'Articulate detailed descriptions of interpersonal dynamics and character traits using formal modifiers.',
          'Infer communicative intent and emotional attitude in personal narratives and biographical essays.',
          'Collaborate in paired interviews negotiating consensus on social empathy scenarios.'
        ],
        grammar_targets: ['present_simple_vs_continuous', 'relative_clauses_defining'],
        vocabulary_domains: ['personality_traits', 'social_relationships', 'emotional_intelligence'],
        language_functions: ['describing_character', 'expressing_feelings', 'comparing_viewpoints'],
        assessment_targets: ['oral_interaction_rubric', 'reading_comprehension_matrix'],
        prerequisite_unit_ids: []
      },
      {
        position: 2,
        title: 'Education, Future Careers & STEAM',
        theme: 'education_and_future_careers',
        skills: ['reading', 'writing', 'listening', 'grammar'],
        knowledge_targets: [
          'HS1_Writing_Formal_Informal_Correspondence',
          'listening_b1_b2_detail_and_attitude',
          'vocab_b1_b2_future_careers_education',
          'grammar_b1_b2_conditionals_progression',
          'func_persuading'
        ],
        learning_outcomes: [
          'Draft formal letters of intent and motivational statements for pre-college academic programs.',
          'Formulate hypothetical future scenarios using first and second conditionals.',
          'Analyze comparative vocational trajectories in science, technology and humanities.'
        ],
        grammar_targets: ['future_forms_will_going_to', 'conditionals_first_and_second'],
        vocabulary_domains: ['higher_education', 'steam_careers', 'professional_skills'],
        language_functions: ['expressing_ambitions', 'justifying_choices', 'formal_requesting'],
        assessment_targets: ['writing_rubric_formal_letter', 'vocational_presentation'],
        prerequisite_unit_ids: []
      },
      {
        position: 3,
        title: 'Technology, Media & Digital Ethics',
        theme: 'technology_and_media',
        skills: ['speaking', 'writing', 'listening'],
        knowledge_targets: [
          'speaking_b1_b2_speculation_and_presentation',
          'HS1_Writing_Opinion_Argument',
          'vocab_b1_b2_technology_media',
          'grammar_b1_b2_passive_voice_discourse',
          'func_speculating'
        ],
        learning_outcomes: [
          'Articulate and defend a nuanced viewpoint on social media algorithms and digital privacy in a structured debate.',
          'Compose a four-paragraph argumentative essay evaluating the impact of artificial intelligence on human creativity.',
          'Speculate on technological developments using modal verbs of deduction and probability markers.'
        ],
        grammar_targets: ['passive_voice_intermediate', 'modal_verbs_deduction', 'discourse_markers_contrast'],
        vocabulary_domains: ['artificial_intelligence', 'data_privacy', 'social_media', 'digital_footprint'],
        language_functions: ['speculating', 'evaluating_arguments', 'expressing_agreement_disagreement'],
        assessment_targets: ['debate_speaking_rubric', 'opinion_essay_b1_b2_rubric'],
        prerequisite_unit_ids: []
      },
      {
        position: 4,
        title: 'Environment, Climate & Global Sustainability',
        theme: 'environment_and_sustainability',
        skills: ['reading', 'listening', 'discourse'],
        knowledge_targets: [
          'listening_b1_b2_note_taking',
          'HS1_Reading_Fact_vs_Opinion',
          'vocab_b1_b2_environment_global_issues',
          'grammar_b1_b2_discourse_connectors'
        ],
        learning_outcomes: [
          'Distinguish verifiable empirical data from subjective opinions in environmental policy reports.',
          'Extract specific detail, speaker tone and urgency in documentary audio interviews on climate adaptation.',
          'Deliver an oral presentation proposing local community sustainable practices.'
        ],
        grammar_targets: ['cause_and_effect_connectors', 'present_perfect_continuous'],
        vocabulary_domains: ['renewable_energy', 'biodiversity', 'carbon_footprint', 'circular_economy'],
        language_functions: ['explaining_cause_and_effect', 'presenting_evidence', 'proposing_solutions'],
        assessment_targets: ['receptive_skills_rubric', 'oral_solution_pitch'],
        prerequisite_unit_ids: []
      },
      {
        position: 5,
        title: 'Health, Wellbeing & Modern Lifestyles',
        theme: 'health_and_lifestyle',
        skills: ['listening', 'speaking', 'vocabulary'],
        knowledge_targets: [
          'listening_b1_b2_main_ideas',
          'speaking_b1_b2_collaborative_discussion',
          'grammar_b1_b2_conditionals_progression',
          'func_summarizing'
        ],
        learning_outcomes: [
          'Provide and evaluate recommendations regarding mental wellness, sleep hygiene and nutritional habits.',
          'Summarize recorded expert podcast discussions on stress management and screen time balance.',
          'Simulate health advice consultations using polite modal expressions.'
        ],
        grammar_targets: ['modals_of_advice_obligation', 'conditionals_second_unreal'],
        vocabulary_domains: ['mental_health', 'nutrition', 'physical_fitness', 'ergonomics'],
        language_functions: ['giving_advice', 'summarizing_discussions', 'expressing_preferences'],
        assessment_targets: ['health_consultation_rubric', 'listening_summary_quiz'],
        prerequisite_unit_ids: []
      },
      {
        position: 6,
        title: 'Society, Culture & Global Citizenship',
        theme: 'society_and_culture',
        skills: ['writing', 'reading', 'intercultural'],
        knowledge_targets: [
          'HS1_Writing_Paragraph_Cohesion',
          'reading_evaluating_bias_and_rhetorical_devices_b2',
          'culture_academic_workplace_communication_styles_b2',
          'grammar_b1_b2_passive_voice_discourse'
        ],
        learning_outcomes: [
          'Compare and contrast multicultural norms, etiquette and civic participation traditions in writing.',
          'Identify subtle cultural assumptions and rhetorical bias in international press editorials.',
          'Construct cohesive multi-paragraph texts using advanced linking devices and nominal references.'
        ],
        grammar_targets: ['past_perfect_simple', 'advanced_comparatives_concessives'],
        vocabulary_domains: ['cultural_heritage', 'civic_rights', 'global_governance', 'tolerance'],
        language_functions: ['contrasting_cultural_norms', 'evaluating_bias', 'defending_civic_causes'],
        assessment_targets: ['comparative_essay_rubric', 'intercultural_case_study'],
        prerequisite_unit_ids: []
      },
      {
        position: 7,
        title: 'Science, Innovation & Epistemic Inquiry',
        theme: 'science_and_discovery',
        skills: ['speaking', 'writing', 'grammar'],
        knowledge_targets: [
          'reading_academic_articles_synthesizing_sources_b2',
          'speaking_impromptu_discourse_persuasion_b2',
          'grammar_mixed_conditionals_unreal_past_present_b2',
          'vocab_academic_collocations_nominal_compounds_b2'
        ],
        learning_outcomes: [
          'Synthesize findings from two short scientific briefs to formulate a hypothesis.',
          'Express hypothetical outcomes using third and mixed conditional constructions.',
          'Participate in impromptu defenses arguing the ethical boundaries of biotechnology and gene editing.'
        ],
        grammar_targets: ['conditionals_third', 'mixed_conditionals', 'reported_speech_intro'],
        vocabulary_domains: ['biotechnology', 'scientific_method', 'space_exploration', 'ethics'],
        language_functions: ['hypothesizing', 'evaluating_evidence', 'impromptu_justifying'],
        assessment_targets: ['scientific_abstract_rubric', 'impromptu_defense_rubric'],
        prerequisite_unit_ids: []
      },
      {
        position: 8,
        title: 'Capstone Integration & Collaborative Symposium',
        theme: 'capstone_integration_project',
        skills: ['speaking', 'writing', 'reading', 'listening'],
        knowledge_targets: [
          'writing_discursive_essays_evaluating_two_views_b2',
          'speaking_complex_negotiation_conflict_resolution_b2',
          'discourse_hedging_epistemic_modality_academic_b2',
          'study_skills_synthesizing_multiple_perspectives_b2'
        ],
        learning_outcomes: [
          'Deliver an integrated group symposium presentation synthesising a multi-disciplinary solution.',
          'Produce a comprehensive 200-word discursive report synthesizing opposing community perspectives.',
          'Negotiate collaborative compromises during a mock UN or collegiate committee session.'
        ],
        grammar_targets: ['inversion_intro', 'hedging_epistemic_modals', 'discourse_progression'],
        vocabulary_domains: ['diplomatic_discourse', 'academic_synthesis', 'consensus_building'],
        language_functions: ['negotiating_agreements', 'hedging_claims', 'summarizing_consensus'],
        assessment_targets: ['capstone_symposium_rubric', 'final_comprehensive_portfolio'],
        prerequisite_unit_ids: []
      }
    ];

    const now = new Date().toISOString();
    return unitsData.map((u, idx) => ({
      id: `unit_hs1_${idx + 1}`,
      course_id: course.id,
      position: u.position || (idx + 1),
      title: u.title || `Unit ${idx + 1}`,
      theme: u.theme || 'general',
      duration_weeks: weeksPerUnit,
      knowledge_targets: u.knowledge_targets || [],
      learning_outcomes: u.learning_outcomes || [],
      skills: u.skills || ['speaking', 'reading', 'writing', 'listening'],
      grammar_targets: u.grammar_targets || [],
      vocabulary_domains: u.vocabulary_domains || [],
      language_functions: u.language_functions || [],
      assessment_targets: u.assessment_targets || [],
      prerequisite_unit_ids: idx > 0 ? [`unit_hs1_${idx}`] : [],
      status: 'approved',
      version: 1,
      metadata: {},
      created_at: now,
      updated_at: now
    }));
  }

  private static planFrenchUnits(course: CourseEntity, numUnits: number, weeksPerUnit: number): UnitEntity[] {
    const unitsData: Partial<UnitEntity>[] = [
      {
        position: 1,
        title: 'Unité 1 : Identité, Relations et Diversité Culturelle',
        theme: 'identite_et_relations',
        skills: ['speaking', 'reading', 'listening', 'grammar'],
        knowledge_targets: [
          'fr_gram_present_indicatif_a1',
          'fr_po_presentation_personnelle_a1',
          'fr_topic_identite_diversite_a1_a2',
          'fr_phon_nasales_intro_a1'
        ],
        learning_outcomes: [
          'Se présenter et décrire des profils personnels et interpersonnels avec fluidité.',
          'Distinguer les sonorités des voyelles nasales françaises en interaction orale.',
          'Formuler des énoncés au présent de l\'indicatif en respectant les accords de base.'
        ],
        grammar_targets: ['present_indicatif', 'articles_definis_indefinis'],
        vocabulary_domains: ['identite', 'famille', 'emotions', 'nationalites'],
        language_functions: ['se_presenter', 'decrire_autrui', 'saluer_formellement'],
        assessment_targets: ['grille_entretien_dirige_a1', 'test_phonetique_nasales'],
        prerequisite_unit_ids: []
      },
      {
        position: 2,
        title: 'Unité 2 : Récits de Vie, Mémoire et Événements Marquants',
        theme: 'recits_et_memoire',
        skills: ['speaking', 'writing', 'reading', 'grammar'],
        knowledge_targets: [
          'fr_gram_passe_compose_vs_imparfait_a2_b1',
          'fr_pe_courriel_amical_invitation_a2',
          'fr_co_dialogues_quotidiens_a2',
          'fr_gram_negation_simple_complexe_a2'
        ],
        learning_outcomes: [
          'Raconter des souvenirs d\'enfance et des voyages passés en alternant passé composé et imparfait.',
          'Rédiger un courriel amical pour relater une expérience vécue et formuler une proposition.',
          'Employer la négation complexe pour nuancer un témoignage personnel.'
        ],
        grammar_targets: ['passe_compose', 'imparfait', 'negation_complexe'],
        vocabulary_domains: ['souvenirs', 'voyages', 'loisirs', 'biographie'],
        language_functions: ['raconter_au_passe', 'exprimer_des_remerciements', 'inviter_amicalement'],
        assessment_targets: ['grille_redaction_amicale_a2', 'evaluation_recit_passe'],
        prerequisite_unit_ids: []
      },
      {
        position: 3,
        title: 'Unité 3 : Projets d\'Avenir, Mobilité et Monde Professionnel',
        theme: 'monde_du_travail_et_avenir',
        skills: ['speaking', 'writing', 'reading', 'vocabulary'],
        knowledge_targets: [
          'fr_gram_futur_simple_et_conditionnel_b1',
          'fr_topic_monde_du_travail_et_carrieres_b1_b2',
          'fr_po_expression_point_de_vue_debat_b1',
          'fr_phon_liaisons_fondamentales_a2'
        ],
        learning_outcomes: [
          'Exprimer des projets d\'études et des intentions professionnelles au futur simple.',
          'Utiliser le conditionnel de politesse dans une démarche formelle ou un entretien simulé.',
          'Appliquer les règles de la liaison obligatoire en situation d\'élocution continue.'
        ],
        grammar_targets: ['futur_simple', 'conditionnel_present'],
        vocabulary_domains: ['metiers', 'etudes_superieures', 'cv', 'candidature'],
        language_functions: ['exprimer_projets', 'demander_poliment', 'argumenter_choix_professionnel'],
        assessment_targets: ['simulation_entretien_embauche', 'grille_expression_projets_b1'],
        prerequisite_unit_ids: []
      },
      {
        position: 4,
        title: 'Unité 4 : Transition Écologique et Développement Durable',
        theme: 'environnement_et_ecologie',
        skills: ['reading', 'writing', 'speaking', 'grammar'],
        knowledge_targets: [
          'fr_topic_ecologie_developpement_durable_b1_b2',
          'fr_ce_presse_articles_opinions_b1_b2',
          'fr_gram_pronoms_cod_coi_y_en_b1',
          'fr_co_emissions_radio_points_de_vue_b1'
        ],
        learning_outcomes: [
          'Analyser des articles de presse environnementaux et en extraire les arguments essentiels.',
          'Remplacer les compléments de lieu et d\'objet avec les pronoms Y, EN, COD et COI.',
          'Prendre position sur les enjeux du réchauffement climatique et de la transition énergétique.'
        ],
        grammar_targets: ['pronoms_cod_coi', 'pronoms_y_en'],
        vocabulary_domains: ['energie_renouvelable', 'climat', 'biodiversite', 'circuits_courts'],
        language_functions: ['defendre_une_cause', 'eviter_les_repetitions', 'analyser_des_donnees'],
        assessment_targets: ['grille_lecture_critique_b1', 'synthese_ecologique_ecrite'],
        prerequisite_unit_ids: []
      },
      {
        position: 5,
        title: 'Unité 5 : Médias, Société Numérique et Esprit Critique',
        theme: 'medias_et_technologie',
        skills: ['listening', 'reading', 'speaking', 'grammar'],
        knowledge_targets: [
          'fr_co_emissions_radio_points_de_vue_b1',
          'fr_gram_subjonctif_present_b1_b2',
          'fr_po_expression_point_de_vue_debat_b1',
          'fr_ce_presse_articles_opinions_b1_b2'
        ],
        learning_outcomes: [
          'Distinguer information vérifiée et infox (fake news) dans des bulletins radiophoniques francophones.',
          'Employer le subjonctif présent pour exprimer le doute, la nécessité et les sentiments.',
          'Intervenir activement dans une table ronde sur l\'impact de l\'intelligence artificielle.'
        ],
        grammar_targets: ['subjonctif_present', 'connecteurs_d_opinion'],
        vocabulary_domains: ['reseaux_sociaux', 'intelligence_artificielle', 'journalisme', 'desinformation'],
        language_functions: ['exprimer_le_doute', 'manifester_une_necessite', 'debattre_en_groupe'],
        assessment_targets: ['grille_debat_citoyen_b1', 'analyse_critique_media'],
        prerequisite_unit_ids: []
      },
      {
        position: 6,
        title: 'Unité 6 : Citoyenneté, Égalité et Débat d\'Idées',
        theme: 'citoyennete_et_societe',
        skills: ['writing', 'speaking', 'reading', 'grammar'],
        knowledge_targets: [
          'fr_pe_essai_argumentatif_lettre_formelle_b1_b2',
          'fr_gram_hypothese_si_b1_b2',
          'fr_gram_connecteurs_logiques_argumentation_b2',
          'fr_gram_subjonctif_present_b1_b2'
        ],
        learning_outcomes: [
          'Rédiger une lettre formelle de réclamation ou une contribution argumentée pour un forum public.',
          'Construire des hypothèses complexes avec SI (réel, potentiel, irréel du présent).',
          'Articuler des paragraphes argumentés à l\'aide de connecteurs logiques de concession et d\'opposition.'
        ],
        grammar_targets: ['systeme_hypothese_si', 'connecteurs_argumentatifs'],
        vocabulary_domains: ['droits_humains', 'egalite_des_genres', 'democratie', 'solidarite'],
        language_functions: ['formuler_une_reclamation', 'conceder_et_opposer', 'proposer_des_alternatives'],
        assessment_targets: ['grille_delf_lettre_formelle_b2', 'essai_argumentatif_evalue'],
        prerequisite_unit_ids: []
      },
      {
        position: 7,
        title: 'Unité 7 : Francophonie Mondiale, Arts et Débat Nuancé',
        theme: 'francophonie_et_culture',
        skills: ['speaking', 'listening', 'reading', 'grammar'],
        knowledge_targets: [
          'fr_po_expose_argumente_defense_b2',
          'fr_co_conferences_debats_nuances_b2',
          'fr_gram_connecteurs_logiques_argumentation_b2',
          'fr_topic_ecologie_developpement_durable_b1_b2'
        ],
        learning_outcomes: [
          'Présenter un exposé oral structuré dégageant la problématique d\'un document textuel complexe.',
          'Défendre son point de vue face aux contre-arguments de l\'examinateur avec nuance et répartie.',
          'Reconnaître les registres de langue et les accents régionaux de la francophonie (Québec, Afrique, Caraïbes).'
        ],
        grammar_targets: ['discours_argumente', 'nuances_modales'],
        vocabulary_domains: ['litterature', 'cinema_francophone', 'patrimoine', 'diversite_linguistique'],
        language_functions: ['exposer_une_problematique', 'nuancer_une_affirmation', 'defendre_sa_these'],
        assessment_targets: ['grille_expose_oral_delf_b2', 'debat_contradictoire_evalue'],
        prerequisite_unit_ids: []
      },
      {
        position: 8,
        title: 'Unité 8 : Atelier de Synthèse et Certification DELF B1/B2 (CENNI)',
        theme: 'simulation_certification_delf',
        skills: ['speaking', 'writing', 'reading', 'listening'],
        knowledge_targets: [
          'fr_assessment_grilles_delf_b1_b2',
          'fr_pattern_simulation_delf',
          'fr_framework_delf_dalf_matrix',
          'fr_framework_cenni_sep_matrix'
        ],
        learning_outcomes: [
          'Accomplir une simulation complète des 4 épreuves du DELF B1/B2 dans les conditions réelles d\'examen.',
          'Auto-évaluer ses productions selon les grilles critériées officielles de France Éducation International.',
          'Valider le profil de compétences requis pour l\'accréditation CENNI niveau 12 à 15 de la SEP au Mexique.'
        ],
        grammar_targets: ['synthese_morphosyntaxique', 'autocorrection_formelle'],
        vocabulary_domains: ['lexique_academique', 'strategies_d_examen', 'gestion_du_temps'],
        language_functions: ['synthetiser_des_documents', 'gerer_le_temps_d_epreuve', 'performer_a_l_examen'],
        assessment_targets: ['epreuve_blanche_delf_b1_b2', 'bilan_global_cenni_sep'],
        prerequisite_unit_ids: []
      }
    ];

    const now = new Date().toISOString();
    return unitsData.map((u, idx) => ({
      id: `unit_fr_${idx + 1}`,
      course_id: course.id,
      position: u.position || (idx + 1),
      title: u.title || `Unité ${idx + 1}`,
      theme: u.theme || 'general',
      duration_weeks: weeksPerUnit,
      knowledge_targets: u.knowledge_targets || [],
      learning_outcomes: u.learning_outcomes || [],
      skills: u.skills || ['speaking', 'reading', 'writing', 'listening'],
      grammar_targets: u.grammar_targets || [],
      vocabulary_domains: u.vocabulary_domains || [],
      language_functions: u.language_functions || [],
      assessment_targets: u.assessment_targets || [],
      prerequisite_unit_ids: idx > 0 ? [`unit_fr_${idx}`] : [],
      status: 'approved',
      version: 1,
      metadata: { language: 'french', framework: 'DELF' },
      created_at: now,
      updated_at: now
    }));
  }

  private static planGenericUnits(course: CourseEntity, numUnits: number, weeksPerUnit: number): UnitEntity[] {
    const now = new Date().toISOString();
    return Array.from({ length: numUnits }, (_, i) => ({
      id: `unit_${course.id}_${i + 1}`,
      course_id: course.id,
      position: i + 1,
      title: `Unit ${i + 1}: Foundations and Competencies`,
      theme: 'general',
      duration_weeks: weeksPerUnit,
      knowledge_targets: [],
      learning_outcomes: [`Demonstrate communicative competence in Unit ${i + 1}`],
      skills: ['speaking', 'reading', 'writing', 'listening'],
      grammar_targets: [],
      vocabulary_domains: [],
      language_functions: [],
      assessment_targets: [],
      prerequisite_unit_ids: i > 0 ? [`unit_${course.id}_${i}`] : [],
      status: 'draft',
      version: 1,
      metadata: {},
      created_at: now,
      updated_at: now
    }));
  }
}
