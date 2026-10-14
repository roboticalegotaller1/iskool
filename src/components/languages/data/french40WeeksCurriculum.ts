import { CurricularWeek } from './curriculumTypes';

export const french40WeeksCurriculum: CurricularWeek[] = [
  // =========================================================================
  // TRIMESTRE 1: FONDAMENTAUX, PHONÉTIQUE ÉLÉMENTAIRE & VIE QUOTIDIENNE (DELF A1 / A1+)
  // =========================================================================
  {
    weekNumber: 1,
    title: 'Semaine 1: Premiers Contacts & Formules de Politesse',
    level: 'A1 (CENNI 3)',
    cefr: 'A1',
    trimester: 1,
    certificationTarget: 'DELF Prim / Junior A1 - France Éducation International',
    pda: 'Comunica saludos, presentaciones formales e informales y expresa su procedencia en lengua francesa con pronunciación clara.',
    lessons: [
      {
        id: 'fr-w1-l1',
        title: 'Salutations au café parisien',
        target: 'Bonjour monsieur, enchanté de faire votre connaissance; comment allez-vous aujourd\'hui?',
        translationEs: 'Buenos días señor, encantado de conocerlo; ¿cómo está usted hoy?',
        phoneticTip: 'Prononciation soignée de la voyelle nasale dans "enchanté" [ɑ̃] et liaison dans "comment_allez-vous".'
      },
      {
        id: 'fr-w1-l2',
        title: 'Épeler son nom, prénom et nationalité',
        target: 'Je m\'appelle Julien, j\'ai quinze ans et je viens fièrement du Mexique.',
        translationEs: 'Me llamo Julien, tengo quince años y provengo orgullosamente de México.',
        phoneticTip: 'Liaison obligatoire du pluriel dans "quinze_ans" [kɛ̃z‿ɑ̃] avec un son [z] voisé.'
      },
      {
        id: 'fr-w1-l3',
        title: 'Les nombres, les coordonnées et l\'heure',
        target: 'Mon numéro de téléphone est le zéro six, quarante-cinq, soixante-douze, quatre-vingts.',
        translationEs: 'Mi número de teléfono es el 06, 45, 72, 80.',
        phoneticTip: 'Structure vigésimale du français: "quatre-vingts" [katʁəvɛ̃] sans prononcer le "ts" final.'
      },
      {
        id: 'fr-w1-l4',
        title: 'Atelier Phonétique: L\'alphabet français et le son [y] vs [u]',
        target: 'Tu as vu la lune rousse au-dessus de la grande avenue?',
        translationEs: '¿Viste la luna roja por encima de la gran avenida?',
        phoneticTip: 'Contraste fondamental entre le [u] de "rousse" (lèvres projetées en arrière) et le [y] de "lune/vu" (lèvres serrées en avant).'
      }
    ]
  },
  {
    weekNumber: 2,
    title: 'Semaine 2: La Ville, Se Repérer & Transports en Commun',
    level: 'A1+ (CENNI 4)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A1+ Niveau Découverte',
    pda: 'Pregunta y proporciona direcciones en la ciudad utilizando preposiciones de lugar y medios de transporte público.',
    lessons: [
      {
        id: 'fr-w2-l1',
        title: 'Dans le métro et le tramway',
        target: 'Pourriez-vous m\'indiquer la station de métro la plus proche pour aller au musée?',
        translationEs: '¿Podría indicarme la estación de metro más cercana para ir al museo?',
        phoneticTip: 'Intonation polie montante sur le conditionnel "pourriez-vous" [puʁjevu].'
      },
      {
        id: 'fr-w2-l2',
        title: 'Demander et indiquer son chemin',
        target: 'Continuez tout droit jusqu\'au carrefour, puis tournez à gauche après la boulangerie.',
        translationEs: 'Continúe todo derecho hasta el cruce, luego gire a la izquierda después de la panadería.',
        phoneticTip: 'Distinction nette entre "tout droit" [tu dʁwa] (recto) et "à droite" [a dʁwat] (a la derecha).'
      },
      {
        id: 'fr-w2-l3',
        title: 'Acheter un titre de transport au guichet',
        target: 'Je voudrais un carnet de tickets et un aller-retour en train pour Versailles, s\'il vous plaît.',
        translationEs: 'Quisiera un paquete de boletos y un viaje redondo en tren a Versalles, por favor.',
        phoneticTip: 'Formule de politesse classique "Je voudrais" [ʒə vudʁɛ] avec "e" caduc.'
      },
      {
        id: 'fr-w2-l4',
        title: 'Atelier Phonétique: Les liaisons de base et l\'enchaînement vocalique',
        target: 'Vous avez un excellent itinéraire pour aller à l\'opéra.',
        translationEs: 'Tiene usted un excelente itinerario para ir a la ópera.',
        phoneticTip: 'Enchaînement consonantique fluide: "vous_avez_un_excellent_itinéraire" [vuz‿ave œ̃n‿ɛksɛlɑ̃t‿itinɛʁɛʁ].'
      }
    ]
  },
  {
    weekNumber: 3,
    title: 'Semaine 3: La Famille, les Relations & Descriptions Physiques',
    level: 'A1 (CENNI 3)',
    cefr: 'A1',
    trimester: 1,
    certificationTarget: 'DELF Prim / Junior A1 - France Éducation International',
    pda: 'Describe el núcleo familiar, parentescos y características físicas empleando adjetivos calificativos concordados en género y número.',
    lessons: [
      {
        id: 'fr-w3-l1',
        title: 'Présenter son arbre généalogique',
        target: 'Voici mes grands-parents, mes parents chaleureux et ma jeune sœur cadette.',
        translationEs: 'Aquí están mis abuelos, mis padres cálidos y mi hermana menor.',
        phoneticTip: 'Prononciation de "sœur" [sœʁ] avec la voyelle ouverte [œ] et non pas [e].'
      },
      {
        id: 'fr-w3-l2',
        title: 'Portrait physique et couleur des yeux',
        target: 'Mon cousin a les yeux marron, des cheveux bruns bouclés et une allure sportive.',
        translationEs: 'Mi primo tiene ojos castaños, cabello castaño ondulado y una apariencia deportiva.',
        phoneticTip: 'Invariabilité de l\'adjectif de couleur "marron" (issu d\'un nom commun).'
      },
      {
        id: 'fr-w3-l3',
        title: 'Traits de caractère et personnalité',
        target: 'Notre professeure est extrêmement bienveillante, dynamique et très patiente avec nous.',
        translationEs: 'Nuestra profesora es sumamente bondadosa, dinámica y muy paciente con nosotros.',
        phoneticTip: 'Marque féminine sonore: "patient" [pasjɑ̃] devient "patiente" [pasjɑ̃t] avec la consonne [t] finale prononcée.'
      },
      {
        id: 'fr-w3-l4',
        title: 'Atelier Phonétique: L\'opposition masculin / féminin à l\'oreille',
        target: 'Un étudiant intelligent; une étudiante intelligente et curieuse.',
        translationEs: 'Un estudiante inteligente; una estudiante inteligente y curiosa.',
        phoneticTip: 'Entraînement de l\'oreille: au masculin la consonne finale est muette, au féminin elle retentit clairement.'
      }
    ]
  },
  {
    weekNumber: 4,
    title: 'Semaine 4: Le Collège, la Classe & le Matériel Scolaire',
    level: 'A1+ (CENNI 4)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A1+ Niveau Découverte',
    pda: 'Identifica materias escolares, útiles del aula y formula peticiones en el contexto educativo utilizando el verbo pouvoir.',
    lessons: [
      {
        id: 'fr-w4-l1',
        title: 'Le cartable et les fournitures de classe',
        target: 'Dans mon sac à dos, j\'ai une trousse, trois stylos à bille et une règle graduée.',
        translationEs: 'En mi mochila, tengo una cartuchera, tres bolígrafos y una regla graduada.',
        phoneticTip: 'Prononciation de "sac à dos" [sak a do] avec voyelle postérieure fermée finale.'
      },
      {
        id: 'fr-w4-l2',
        title: 'Les disciplines scolaires et préférences',
        target: 'J\'adore les cours de sciences physiques et d\'histoire-géographie au collège.',
        translationEs: 'Me encantan las clases de ciencias físicas y de historia y geografía en la secundaria.',
        phoneticTip: 'Élision de la préposition devant voyelle: "d\'histoire" [distwaʁ].'
      },
      {
        id: 'fr-w4-l3',
        title: 'Interactions en classe avec l\'enseignant',
        target: 'Pardon monsieur, est-ce que je peux effacer le tableau blanc maintenant?',
        translationEs: 'Perdón profesor, ¿puedo borrar el pizarrón blanco ahora?',
        phoneticTip: 'Tournure interrogative canonique avec "est-ce que" [ɛskə].'
      },
      {
        id: 'fr-w4-l4',
        title: 'Atelier Phonétique: Le son [ʁ] français (R uvulaire)',
        target: 'Regardez la règle rouge posée sur le grand répertoire.',
        translationEs: 'Miren la regla roja colocada sobre la gran libreta de notas.',
        phoneticTip: 'Friction douce de l\'uvule contre le dos de la langue, sans rouler la pointe de la langue comme en espagnol.'
      }
    ]
  },
  {
    weekNumber: 5,
    title: 'Semaine 5: L\'Heure, le Calendrier & l\'Emploi du Temps',
    level: 'A1+ (CENNI 4)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A1+ Niveau Découverte',
    pda: 'Expresa horarios escolares, días de la semana y agenda semanal empleando expresiones temporales precisas.',
    lessons: [
      {
        id: 'fr-w5-l1',
        title: 'Dire l\'heure précise au quotidien',
        target: 'Il est midi et quart; la sonnerie retentira exactement à treize heures trente.',
        translationEs: 'Son las doce y cuarto del día; el timbre sonará exactamente a la una y media.',
        phoneticTip: 'Différence entre "midi" [midi] (12h00) et "minuit" [minɥi] (00h00).'
      },
      {
        id: 'fr-w5-l2',
        title: 'L\'agenda hebdomadaire et les jours',
        target: 'Le mardi après-midi, nous avons une séance d\'informatique et de robotique.',
        translationEs: 'Los martes por la tarde, tenemos una sesión de informática y robótica.',
        phoneticTip: 'Les jours de la semaine ne prennent pas de majuscule en français (mardi, mercredi, etc.).'
      },
      {
        id: 'fr-w5-l3',
        title: 'Prendre un rendez-vous formel',
        target: 'Seriez-vous disponible jeudi prochain à quatorze heures pour réviser l\'exposé?',
        translationEs: '¿Estaría disponible el próximo jueves a las dos de la tarde para repasar la exposición?',
        phoneticTip: 'Prononciation de "quatorze" [katɔʁz] avec voyelle mi-ouverte [ɔ].'
      },
      {
        id: 'fr-w5-l4',
        title: 'Atelier Phonétique: Rythme syllabique et accentuation de groupe',
        target: 'Le matin, à huit heures, les élèves entrent en classe.',
        translationEs: 'Por la mañana, a las ocho, los alumnos entran a clase.',
        phoneticTip: 'En français, l\'accent tonique frappe toujours la toute dernière syllabe prononcée du groupe rythmique.'
      }
    ]
  },
  {
    weekNumber: 6,
    title: 'Semaine 6: Le Logement, les Pièces & le Mobilier',
    level: 'A1+ (CENNI 4)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A1+ Niveau Découverte',
    pda: 'Describe su casa o departamento, distribución de habitaciones y mobiliario utilizando il y a y preposiciones espaciales.',
    lessons: [
      {
        id: 'fr-w6-l1',
        title: 'La maison et ses différentes pièces',
        target: 'Notre appartement dispose d\'un salon lumineux, d\'une cuisine moderne et d\'un grand balcon.',
        translationEs: 'Nuestro departamento dispone de una sala luminosa, de una cocina moderna y de un gran balcón.',
        phoneticTip: 'Prononciation de "salon" [salɔ̃] avec la voyelle nasale postérieure [ɔ̃].'
      },
      {
        id: 'fr-w6-l2',
        title: 'Le mobilier de la chambre à coucher',
        target: 'Il y a un bureau en bois près de la fenêtre et une armoire à vêtements.',
        translationEs: 'Hay un escritorio de madera cerca de la ventana y un ropero.',
        phoneticTip: 'Structure impersonnelle "Il y a" [ilja] très rapide et liée.'
      },
      {
        id: 'fr-w6-l3',
        title: 'Les tâches ménagères et la vie domestique',
        target: 'Chaque samedi matin, je range soigneusement ma chambre et j\'arrose les plantes vertes.',
        translationEs: 'Cada sábado por la mañana, ordeno cuidadosamente mi cuarto y riego las plantas verdes.',
        phoneticTip: 'Articuler l\'adverbe "soigneusement" [swaɲøzmɑ̃] avec le son [ɲ] (équivalent du "ñ").'
      },
      {
        id: 'fr-w6-l4',
        title: 'Atelier Phonétique: Les voyelles nasales [ɑ̃], [ɛ̃], [ɔ̃]',
        target: 'Le grand marin blanc chante une chanson sans fin.',
        translationEs: 'El gran marinero blanco canta una canción sin fin.',
        phoneticTip: 'Le passage de l\'air à travers les fosses nasales sans fermer la gorge: [ɑ̃] dans "grand", [ɛ̃] dans "marin/fin", [ɔ̃] dans "chanson".'
      }
    ]
  },
  {
    weekNumber: 7,
    title: 'Semaine 7: L\'Alimentation, les Marchés & Faire les Courses',
    level: 'A1+ (CENNI 5)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A2 Niveau Intermédiaire Initial',
    pda: 'Realiza compras de alimentos en comercios locales, solicita cantidades con artículos partitivos (du, de la, des) y pregunta precios.',
    lessons: [
      {
        id: 'fr-w7-l1',
        title: 'Au marché primeur: fruits et légumes',
        target: 'Je voudrais deux kilos de pommes de terre, un kilo de poires et des carottes fraîches.',
        translationEs: 'Quisiera dos kilos de papas, un kilo de peras y zanahorias frescas.',
        phoneticTip: 'Prononciation de "pommes de terre" [pɔm də tɛʁ] sans prononcer le "s" de pommes.'
      },
      {
        id: 'fr-w7-l2',
        title: 'Les articles partitifs (du, de la, de l\', des)',
        target: 'Pour le petit-déjeuner, nous buvons du jus d\'orange et mangeons de la confiture.',
        translationEs: 'Para el desayuno, tomamos jugo de naranja y comemos mermelada.',
        phoneticTip: 'Utilisation des partitifs pour les quantités indéterminées en français.'
      },
      {
        id: 'fr-w7-l3',
        title: 'Demander le prix et régler son achat',
        target: 'Combien coûte ce morceau de fromage de chèvre fermier, s\'il vous plaît?',
        translationEs: '¿Cuánto cuesta este trozo de queso de cabra artesanal, por favor?',
        phoneticTip: 'Intonation interrogative courante avec "Combien coûte..." [kɔ̃bjɛ̃ kut].'
      },
      {
        id: 'fr-w7-l4',
        title: 'Atelier Phonétique: Le son [ʃ] (ch) vs [s]',
        target: 'Chez le chef, six saucisses sèches sont choisies.',
        translationEs: 'En casa del chef, seis salchichas secas son seleccionadas.',
        phoneticTip: 'Contraste entre la chuintante [ʃ] (lèvres en cœur) et la sifflante [s] (dents serrées).'
      }
    ]
  },
  {
    weekNumber: 8,
    title: 'Semaine 8: Les Vêtements, les Couleurs & le Style Personnel',
    level: 'A1+ (CENNI 5)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A2 Palier Évolutif',
    pda: 'Describe atuendos según la ocasión y el clima, expresa gustos textiles y concuerda adjetivos de color en género y número.',
    lessons: [
      {
        id: 'fr-w8-l1',
        title: 'Garde-robe de saison et tissus',
        target: 'En hiver, je porte un manteau en laine épais, une écharpe rouge et des gants en cuir.',
        translationEs: 'En invierno, uso un abrigo grueso de lana, una bufanda roja y guantes de piel.',
        phoneticTip: 'Prononciation de "manteau" [mɑ̃to] avec [o] fermé et "cuir" [kɥiʁ] avec consonne semi-voyelle [ɥ].'
      },
      {
        id: 'fr-w8-l2',
        title: 'L\'accord des adjetifs de couleur',
        target: 'Elle a choisi une chemise blanche élégante et une veste noire boutonnée.',
        translationEs: 'Ella eligió una camisa blanca elegante y un saco negro abotonado.',
        phoneticTip: 'Le féminin de "blanc" est "blanche" [blɑ̃ʃ] avec apparition du son [ʃ].'
      },
      {
        id: 'fr-w8-l3',
        title: 'Exprimer son avis sur la mode vestimentaire',
        target: 'Je trouve que cette tenue est à la fois très confortable et vraiment moderne.',
        translationEs: 'Me parece que este atuendo es a la vez muy cómodo y realmente moderno.',
        phoneticTip: 'Tournure d\'opinion "Je trouve que..." [ʒə tʁuv kə] avec débit régulier.'
      },
      {
        id: 'fr-w8-l4',
        title: 'Atelier Phonétique: La semi-voyelle [ɥ] dans "huit", "nuit", "cuir"',
        target: 'Aujourd\'hui à minuit, la pluie tombe sur la colline fleurie.',
        translationEs: 'Hoy a la medianoche, la lluvia cae sobre la colina florida.',
        phoneticTip: 'Formation du son [ɥ]: prononcez un [y] puis glissez instantanément vers la voyelle suivante.'
      }
    ]
  },
  {
    weekNumber: 9,
    title: 'Semaine 9: Les Loisirs, les Passions & les Pratiques Sportives',
    level: 'A1+ (CENNI 5)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A2 Palier Évolutif',
    pda: 'Comunica pasatiempos favoritos, actividades deportivas y culturales utilizando jouer à / jouer de / faire de de forma correcta.',
    lessons: [
      {
        id: 'fr-w9-l1',
        title: 'Les activités de loisirs du week-end',
        target: 'Le samedi, j\'aime écouter de la musique classique et lire des romans historiques.',
        translationEs: 'Los sábados, me gusta escuchar música clásica y leer novelas históricas.',
        phoneticTip: 'Élision et liaison dans "j\'aime écouter" [ʒɛm‿ekute].'
      },
      {
        id: 'fr-w9-l2',
        title: 'Sports et jeux: "jouer à" vs "faire de"',
        target: 'Mon ami joue au football le mercredi et fait de la natation chaque matin.',
        translationEs: 'Mi amigo juega fútbol los miércoles y practica natación cada mañana.',
        phoneticTip: 'Règle essentielle: "jouer au / aux" (sports collectifs/jeux) vs "faire du / de la" (pratiques sportives).'
      },
      {
        id: 'fr-w9-l3',
        title: 'Les instruments de musique: "jouer de"',
        target: 'Elle joue du violon avec talent et son frère cadet joue de la clarinette.',
        translationEs: 'Ella toca el violín con talento y su hermano menor toca el clarinete.',
        phoneticTip: 'Pour les instruments de musique, on emploie obligatoirement la préposition "de" contractée.'
      },
      {
        id: 'fr-w9-l4',
        title: 'Atelier Phonétique: Le son [œ̃] vs [ɛ̃] et les nasales modernes',
        target: 'Un bon parfum brun réveille un matin printanier.',
        translationEs: 'Un buen perfume castaño despierta una mañana primaveral.',
        phoneticTip: 'Évolution du français contemporain: prononciation claire et distincte des voyelles antérieures nasales.'
      }
    ]
  },
  {
    weekNumber: 10,
    title: 'Semaine 10: La Météo, les Saisons & la Nature',
    level: 'A1+ (CENNI 5)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A2 Palier Évolutif',
    pda: 'Describe el clima actual, pronósticos meteorológicos y cambios estacionales utilizando las estructuras impersonales il fait / il y a.',
    lessons: [
      {
        id: 'fr-w10-l1',
        title: 'Le bulletin météo quotidien',
        target: 'Aujourd\'hui, il fait un temps ensoleillé mais le vent souffle fort dans le nord.',
        translationEs: 'Hoy, hace un clima soleado pero el viento sopla fuerte en el norte.',
        phoneticTip: 'Expressions météorologiques: "il fait beau", "il fait chaud", "le vent souffle".'
      },
      {
        id: 'fr-w10-l2',
        title: 'Les quatre saisons et la végétation',
        target: 'Au printemps, les cerisiers fleurissent et les journées deviennent visiblement plus longues.',
        translationEs: 'En primavera, los cerezos florecen y los días se vuelven visiblemente más largos.',
        phoneticTip: 'Prononciation de "printemps" [pʁɛ̃tɑ̃] avec "p" et "s" finaux muets.'
      },
      {
        id: 'fr-w10-l3',
        title: 'Phénomènes climatiques extrêmes',
        target: 'Un violent orage s\'abat sur la vallée avec des éclairs et de la grêle soudaine.',
        translationEs: 'Una violenta tormenta cae sobre el valle con relámpagos y granizo repentino.',
        phoneticTip: 'Prononciation de "grêle" [ɡʁɛl] avec voyelle ouverte longue.'
      },
      {
        id: 'fr-w10-l4',
        title: 'Atelier Phonétique: L\'intonation interrogative et exclamative',
        target: 'Quel magnifique paysage ensoleillé! Penses-tu qu\'il neigera demain?',
        translationEs: '¡Qué magnífico paisaje soleado! ¿Crees que nevará mañana?',
        phoneticTip: 'Courbe mélodique descendante triomphale pour l\'exclamation et courbe ascendante nette pour la question.'
      }
    ]
  },
  {
    weekNumber: 11,
    title: 'Semaine 11: Les Émotions, les Sentiments & la Politesse Sociale',
    level: 'A1+ (CENNI 5)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A2 Palier Évolutif',
    pda: 'Comunica estados de ánimo, sentimientos de gratitud y responde con empatía en situaciones comunicativas de la vida diaria.',
    lessons: [
      {
        id: 'fr-w11-l1',
        title: 'Exprimer la joie, la surprise ou l\'inquiétude',
        target: 'Je suis très heureux d\'avoir réussi mon projet et je vous remercie pour votre soutien.',
        translationEs: 'Estoy muy feliz de haber aprobado mi proyecto y le agradezco por su apoyo.',
        phoneticTip: 'Liaison dans "très_heureux" [tʁɛz‿øʁø] et son [ø] fermé dans "heureux".'
      },
      {
        id: 'fr-w11-l2',
        title: 'Formules de courtoisie et d\'excuses formelles',
        target: 'Je vous prie de bien vouloir m\'excuser pour ce retard tout à fait involontaire.',
        translationEs: 'Le ruego que tenga a bien disculparme por este retraso del todo involuntario.',
        phoneticTip: 'Diction solennelle de la haute politesse française: "Je vous prie de bien vouloir..."'
      },
      {
        id: 'fr-w11-l3',
        title: 'Manifester de la compassion et encourager',
        target: 'Ne t\'inquiète pas, tu as fait d\'immenses progrès et nous croyons tous en toi.',
        translationEs: 'No te preocupes, has hecho inmensos progresos y todos creemos en ti.',
        phoneticTip: 'Prononciation de "tous" [tus] avec le "s" sonore lorsqu\'il s\'agit d\'un pronom.'
      },
      {
        id: 'fr-w11-l4',
        title: 'Atelier Phonétique: L\'accent d\'insistance expressif en français',
        target: 'C\'est absolument formidable d\'accomplir un tel exploit ensemble!',
        translationEs: '¡Es absolutamente formidable lograr semejante hazaña juntos!',
        phoneticTip: 'L\'accent d\'insistance frappe la première syllabe à consonne dans les mots de forte émotion ("AB-solument").'
      }
    ]
  },
  {
    weekNumber: 12,
    title: 'Semaine 12: Le Quartier, les Commerces & la Vie Citoyenne',
    level: 'A1+ (CENNI 5)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Junior A1 / A2 Palier Évolutif',
    pda: 'Interactúa en establecimientos comunitarios (panadería, farmacia, correos) y solicita servicios públicos con solvencia lingüística.',
    lessons: [
      {
        id: 'fr-w12-l1',
        title: 'À la boulangerie et à la pâtisserie',
        target: 'Une baguette tradition bien cuite et deux croissants au beurre, s\'il vous plaît.',
        translationEs: 'Una baguette tradicional bien cocida y dos croissants de mantequilla, por favor.',
        phoneticTip: 'Prononciation de "croissants" [kʁwasɑ̃] avec consonne finale muette.'
      },
      {
        id: 'fr-w12-l2',
        title: 'À la pharmacie et conseils de santé légers',
        target: 'Auriez-vous des pastilles pour adoucir la gorge et soulager la toux?',
        translationEs: '¿Tendría pastillas para suavizar la garganta y calmar la tos?',
        phoneticTip: 'Prononciation de "toux" [tu] avec "x" final muet.'
      },
      {
        id: 'fr-w12-l3',
        title: 'Au bureau de poste: expédier un colis',
        target: 'Je souhaiterais affranchir ce paquet postal en recommandé prioritaire pour l\'étranger.',
        translationEs: 'Desearía timbrar este paquete postal por correo certificado prioritario al extranjero.',
        phoneticTip: 'Prononciation soignée de "recommandé" [ʁəkɔmɑ̃de] et vocabulaire postal canonique.'
      },
      {
        id: 'fr-w12-l4',
        title: 'Atelier Phonétique: Les liaisons facultatives vs interdites',
        target: 'Un grand_homme (obligatoire); Des enfants / et un ami (interdite après "et").',
        translationEs: 'Un gran hombre (obligatoria); Unos niños / y un amigo (prohibida después de "et").',
        phoneticTip: 'Règle d\'or du DELF: interdiction absolue de faire la liaison après la conjonction "et"!'
      }
    ]
  },
  {
    weekNumber: 13,
    title: 'Semaine 13: Évaluation du Trimestre 1 & Simulacre Officiel DELF A1',
    level: 'A1+ (CENNI 5)',
    cefr: 'A1+',
    trimester: 1,
    certificationTarget: 'DELF Prim / Junior A1 Diplôme Officiel Validé - France Éducation International',
    pda: 'Demuestra dominio integral en comprensión oral, comprensión escrita, producción escrita y producción oral en simulacro DELF A1.',
    lessons: [
      {
        id: 'fr-w13-l1',
        title: 'Épreuve Orale DELF A1 Partie 1: Entretien dirigé',
        target: 'Bonjour mesdames et messieurs les examinateurs, je m\'appelle Mateo et j\'apprends le français avec passion.',
        translationEs: 'Buenos días señoras y señores examinadores, me llamo Mateo y aprendo francés con pasión.',
        phoneticTip: 'Postura segura, mirada a los evaluadores y articulación impecable en la apertura.'
      },
      {
        id: 'fr-w13-l2',
        title: 'Épreuve Orale DELF A1 Partie 2: Échange d\'informations',
        target: 'À quelle heure commence le concert de musique francophone ce samedi soir?',
        translationEs: '¿A qué hora comienza el concierto de música francófona este sábado por la noche?',
        phoneticTip: 'Formulation interrogative à partir de cartes-mots déclencheurs comme exigé au DELF A1.'
      },
      {
        id: 'fr-w13-l3',
        title: 'Épreuve Orale DELF A1 Partie 3: Jeu de rôle simulé au magasin',
        target: 'Pardon madame, j\'aimerais essayer ce pull en taille moyenne dans la cabine.',
        translationEs: 'Perdón señora, me gustaría probarme este suéter en talla mediana en el vestidor.',
        phoneticTip: 'Interaction vivante d\'achat avec questionnement sur le prix et remerciements.'
      },
      {
        id: 'fr-w13-l4',
        title: 'Soutenance de Palier: Validation du Diplôme Découverte A1',
        target: 'Grâce à un travail méthodique quotidien, j\'ai acquis les bases solides de la communication en français.',
        translationEs: 'Gracias a un trabajo metódico diario, he adquirido las bases sólidas de la comunicación en francés.',
        phoneticTip: 'Discours solennel de réussite avec intonation posée et fierté académique.'
      }
    ]
  },

  // =========================================================================
  // TRIMESTRE 2: CONSOLIDATION, RÉCITS AU PASSÉ & INTERACTION SOCIALE (DELF A2 / A2+)
  // =========================================================================
  {
    weekNumber: 14,
    title: 'Semaine 14: Souvenirs d\'Enfance & Récits au Passé Composé',
    level: 'A2 (CENNI 6)',
    cefr: 'A2',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 - France Éducation International',
    pda: 'Narra anécdotas personales y recuerdos familiares empleando el passé composé con los auxiliares avoir y être.',
    lessons: [
      {
        id: 'fr-w14-l1',
        title: 'Récit d\'une journée mémorable',
        target: 'Hier, nous avons visité le musée d\'histoire et nous avons découvert des sculptures magnifiques.',
        translationEs: 'Ayer, visitamos el museo de historia y descubrimos esculturas magníficas.',
        phoneticTip: 'Prononciation nette du participe passé en "-é" [e] sans traîner la voyelle.'
      },
      {
        id: 'fr-w14-l2',
        title: 'Les verbes de mouvement avec l\'auxiliaire "être"',
        target: 'Elle est partie très tôt ce matin et elle est arrivée à destination sans encombre.',
        translationEs: 'Ella partió muy temprano esta mañana y llegó a su destino sin contratiempos.',
        phoneticTip: 'Accord systématique du participe passé au féminin: "partie" [paʁti], "arrivée" [aʁive].'
      },
      {
        id: 'fr-w14-l3',
        title: 'Les marqueurs temporels du passé',
        target: 'Il y a deux semaines, notre promotion a remporté le premier prix du concours académique.',
        translationEs: 'Hace dos semanas, nuestra generación ganó el primer premio del concurso académico.',
        phoneticTip: 'Utilisation de "il y a" + durée pour exprimer le temps écoulé.'
      },
      {
        id: 'fr-w14-l4',
        title: 'Atelier Phonétique: L\'élision et l\'enchaînement avec les pronoms au passé',
        target: 'Je l\'ai vu, tu l\'as su, nous l\'avons pris ensemble.',
        translationEs: 'Yo lo vi, tú lo supiste, nosotros lo tomamos juntos.',
        phoneticTip: 'Fluidité totale des pronoms élidés devant la voyelle de l\'auxiliaire avoir: [ʒle vy], [ty la sy].'
      }
    ]
  },
  {
    weekNumber: 15,
    title: 'Semaine 15: Écologie, Climat & Biodiversité',
    level: 'A2+ (CENNI 7)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 / B1 Passerelle',
    pda: 'Defiende su postura sobre el calentamiento global y propone iniciativas ecológicas escolares empleando conectores causales.',
    lessons: [
      {
        id: 'fr-w15-l1',
        title: 'Débat sur les énergies renouvelables',
        target: 'Il est impératif que nous réduisions nos déchets plastiques pour préserver les océans.',
        translationEs: 'Es imperativo que reduzcamos nuestros desechos plásticos para preservar los océanos.',
        phoneticTip: 'Prononciation de "déchets" [deʃɛ] avec voyelle ouverte et "plastiques" [plastik].'
      },
      {
        id: 'fr-w15-l2',
        title: 'Exprimer la cause et la conséquence',
        target: 'La pollution industrielle détruit les écosystèmes; par conséquent, des espèces disparaissent.',
        translationEs: 'La contaminación industrial destruye los ecosistemas; por consiguiente, desaparecen especies.',
        phoneticTip: 'Articulation solennelle du connecteur logique "par conséquent" [paʁ kɔ̃sekɑ̃].'
      },
      {
        id: 'fr-w15-l3',
        title: 'Protéger la forêt tropicale et la biodiversité',
        target: 'La déforestation massive menace gravement l\'équilibre climatique de notre planète.',
        translationEs: 'La deforestación masiva amenaza gravemente el equilibrio climático de nuestro planeta.',
        phoneticTip: 'Adverbe en "-ment" avec voyelle nasale finale [mɑ̃].'
      },
      {
        id: 'fr-w15-l4',
        title: 'Atelier Phonétique: Discours argumentatif fluide et liaison enchaînée',
        target: 'Chaque geste quotidien façonne l\'avenir écologique de notre monde.',
        translationEs: 'Cada gesto cotidiano moldea el porvenir ecológico de nuestro mundo.',
        phoneticTip: 'Rythme oratoire soutenu avec respiration diaphragmatique sur les temps forts.'
      }
    ]
  },
  {
    weekNumber: 16,
    title: 'Semaine 16: La Santé, le Corps Humain & la Consultation Médicale',
    level: 'A2+ (CENNI 7)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 - France Éducation International',
    pda: 'Describe síntomas de malestar físico ante profesionales de la salud y comprende recetas médicas con el condicional de cortesía.',
    lessons: [
      {
        id: 'fr-w16-l1',
        title: 'Chez le médecin généraliste',
        target: 'J\'ai de la fièvre, des courbatures musculaires et mal à la tête depuis avant-hier.',
        translationEs: 'Tengo fiebre, dolores musculares y dolor de cabeza desde antier.',
        phoneticTip: 'Expression "avoir mal à" contractée: "mal au ventre", "mal à la gorge", "mal aux dents".'
      },
      {
        id: 'fr-w16-l2',
        title: 'Comprendre une prescription médicale',
        target: 'Prenez deux comprimés effervescents après chaque repas pendant cinq jours consécutifs.',
        translationEs: 'Tome dos pastillas efervescentes después de cada comida durante cinco días consecutivos.',
        phoneticTip: 'Prononciation de "comprimés" [kɔ̃pʁime] et "effervescents" [efɛʁvɛsɑ̃].'
      },
      {
        id: 'fr-w16-l3',
        title: 'Donner des conseils d\'hygiène de vie',
        target: 'Il faudrait pratiquer une activité physique régulière et dormir huit heures par nuit.',
        translationEs: 'Habría que practicar una actividad física regular y dormir ocho horas por noche.',
        phoneticTip: 'Formule impersonnelle conseillère "Il faudrait" [il fodʁɛ] au conditionnel présent.'
      },
      {
        id: 'fr-w16-l4',
        title: 'Atelier Phonétique: Les consonnes finales muettes du corps humain',
        target: 'Le nez, le dos, le pied, l\'estomac, les doigts.',
        translationEs: 'La nariz, la espalda, el pie, el estómago, los dedos.',
        phoneticTip: 'Consonnes muettes finales absolues: "z" dans nez, "s" dans dos, "d" dans pied, "c" dans estomac, "g" et "t" dans doigts.'
      }
    ]
  },
  {
    weekNumber: 17,
    title: 'Semaine 17: Les Voyages, le Tourisme & l\'Aéroport International',
    level: 'A2+ (CENNI 8)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 / B1 Passerelle',
    pda: 'Gestiona trámites de viaje, reservas en hoteles y abordaje en estaciones y aeropuertos en países francófonos.',
    lessons: [
      {
        id: 'fr-w17-l1',
        title: 'À l\'enregistrement des bagages à l\'aéroport',
        target: 'Voici mon passeport biométrique et ma carte d\'embarquement pour le vol AF quatre-vingt-dix.',
        translationEs: 'Aquí está mi pasaporte biométrico y mi pase de abordar para el vuelo AF 90.',
        phoneticTip: 'Prononciation soignée des chiffres de vol et de "carte d\'embarquement".'
      },
      {
        id: 'fr-w17-l2',
        title: 'Réserver une chambre d\'hôtel',
        target: 'Nous avons réservé une chambre double avec vue panoramique et petit-déjeuner inclus.',
        translationEs: 'Reservamos una habitación doble con vista panorámica y desayuno incluido.',
        phoneticTip: 'Prononciation du son [y] dans "vue" [vy] et "inclus" [ɛ̃kly].'
      },
      {
        id: 'fr-w17-l3',
        title: 'À l\'office de tourisme municipal',
        target: 'Pourriez-vous nous remettre un plan de la ville et les horaires des monuments historiques?',
        translationEs: '¿Podría entregarnos un plano de la ciudad y los horarios de los monumentos históricos?',
        phoneticTip: 'Ton poli et distingué auprès des agents d\'accueil touristique.'
      },
      {
        id: 'fr-w17-l4',
        title: 'Atelier Phonétique: L\'accent tonique en fin de mot composé touristique',
        target: 'La carte d\'embarquement, l\'office de tourisme, la chambre d\'hôtel.',
        translationEs: 'La tarjeta de embarque, la oficina de turismo, la habitación de hotel.',
        phoneticTip: 'Accentuation unique sur la dernière syllabe du groupe syntaxique.'
      }
    ]
  },
  {
    weekNumber: 18,
    title: 'Semaine 18: La Gastronomie Française, Recettes & Art de la Table',
    level: 'A2+ (CENNI 8)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 / B1 Passerelle',
    pda: 'Comprende recetas culinarias tradicionales de la francofonía, ordena platillos en un restaurante y expresa opiniones de degustación.',
    lessons: [
      {
        id: 'fr-w18-l1',
        title: 'Les verbes de cuisine et étapes d\'une recette',
        target: 'Faites dorer les oignons émincés, ajoutez un filet d\'huile d\'olive et laissez mijoter à feu doux.',
        translationEs: 'Dore las cebollas picadas, agregue un chorrito de aceite de oliva y deje hervir a fuego lento.',
        phoneticTip: 'Verbe culinaire d\'excellence "mijoter" [miʒɔte] avec voyelle mi-ouverte [ɔ].'
      },
      {
        id: 'fr-w18-l2',
        title: 'Commander au restaurant gastronomique',
        target: 'En entrée, je prendrai la soupe à l\'oignon gratinée, et comme plat principal, le magret de canard.',
        translationEs: 'De entrada, tomaré la sopa de cebolla gratinada, y como plato fuerte, la pechuga de pato.',
        phoneticTip: 'Futur simple de décision "je prendrai" [ʒə pʁɑ̃dʁe] avec [e] fermé.'
      },
      {
        id: 'fr-w18-l3',
        title: 'Les restrictions alimentaires et compliments au chef',
        target: 'Ce plat aux herbes de Provence est succulent; mes compliments chaleureux au chef de cuisine.',
        translationEs: 'Este platillo con hierbas de Provenza es suculento; mis cálidos cumplidos al chef de cocina.',
        phoneticTip: 'Prononciation de "succulent" [sykylɑ̃] avec les deux sons [y].'
      },
      {
        id: 'fr-w18-l4',
        title: 'Atelier Phonétique: Le son [wa] dans "croissant", "boire", "poire"',
        target: 'Trois rois boivent du bouillon froid au fond du bois.',
        translationEs: 'Tres reyes beben caldo frío en el fondo del bosque.',
        phoneticTip: 'Divergence consonantique rapide de la diphtongue française [wa].'
      }
    ]
  },
  {
    weekNumber: 19,
    title: 'Semaine 19: Les Nouvelles Technologies & Réseaux Sociaux',
    level: 'A2+ (CENNI 8)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 / B1 Passerelle',
    pda: 'Comenta sobre plataformas digitales, hábitos de consumo en internet y buenas prácticas de privacidad en línea.',
    lessons: [
      {
        id: 'fr-w19-l1',
        title: 'Le lexique du numérique et des réseaux',
        target: 'Je télécharge mes cours magistraux sur le serveur pédagogique de notre établissement.',
        translationEs: 'Descargo mis clases magistrales en el servidor pedagógico de nuestro plantel.',
        phoneticTip: 'Prononciation de "télécharge" [teleʃaʁʒ] avec le son chuintant [ʃ] puis fricatif [ʒ].'
      },
      {
        id: 'fr-w19-l2',
        title: 'La cybersécurité et la vie privée',
        target: 'Il est essentiel de choisir un mot de passe complexe et d\'activer l\'authentification double.',
        translationEs: 'Es esencial elegir una contraseña compleja y activar la autenticación doble.',
        phoneticTip: 'Prononciation de "complexe" [kɔ̃plɛks] avec consonne finale double [ks].'
      },
      {
        id: 'fr-w19-l3',
        title: 'L\'empreinte numérique responsable',
        target: 'Les publications que nous partageons en ligne reflètent notre identité et nos valeurs.',
        translationEs: 'Las publicaciones que compartimos en línea reflejan nuestra identidad y nuestros valores.',
        phoneticTip: 'Marque plurielle dans "les publications" sans prononcer le "s" final.'
      },
      {
        id: 'fr-w19-l4',
        title: 'Atelier Phonétique: L\'accentuation des sigles en français (IA, TGV, SMS)',
        target: 'L\'IA perfectionne les moteurs de recherche et le TGV accélère les liaisons régionales.',
        translationEs: 'La IA perfecciona los motores de búsqueda y el TGV acelera las conexiones regionales.',
        phoneticTip: 'Chaque lettre du sigle reçoit un accent égal avec montée sur la dernière: "I-A" [i-a], "T-G-V" [te-ʒe-ve].'
      }
    ]
  },
  {
    weekNumber: 20,
    title: 'Semaine 20: Les Métiers, le Monde du Travail & Projets d\'Avenir',
    level: 'A2+ (CENNI 8)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 / B1 Passerelle',
    pda: 'Expresa vocaciones profesionales, describe responsabilidades laborales y redacta un currículum vitae elemental en francés.',
    lessons: [
      {
        id: 'fr-w20-l1',
        title: 'Les carrières contemporaines et scientifiques',
        target: 'Les chercheuses en nanotechnologie conçoivent des matériaux ultra-résistants et innovants.',
        translationEs: 'Las investigadoras en nanotecnología diseñan materiales ultrarresistentes e innovadores.',
        phoneticTip: 'Féminin des métiers: "chercheur" devient "chercheuse" [ʃɛʁʃøz] avec le son sonore [z].'
      },
      {
        id: 'fr-w20-l2',
        title: 'Parler de ses compétences clés sur un CV',
        target: 'Je possède d\'excellentes capacités d\'analyse, un esprit d\'équipe et une bonne maîtrise des langues.',
        translationEs: 'Poseo excelentes capacidades de análisis, espíritu de equipo y un buen dominio de los idiomas.',
        phoneticTip: 'Prononciation de "maîtrise" [mɛtʁiz] avec "i" long et "z" voisé.'
      },
      {
        id: 'fr-w20-l3',
        title: 'Exprimer ses souhaits d\'avenir avec "j\'aimerais"',
        target: 'Après le baccalauréat, j\'aimerais poursuivre des études universitaires en relations internationales.',
        translationEs: 'Tras el bachillerato, me gustaría cursar estudios universitarios en relaciones internacionales.',
        phoneticTip: 'Conditionnel de souhait "j\'aimerais" [ʒɛmʁɛ] avec diphtongue fluide.'
      },
      {
        id: 'fr-w20-l4',
        title: 'Atelier Phonétique: L\'alternance masculin/féminin des professions (-eur/-euse, -teur/-trice, -ien/-ienne)',
        target: 'Acteur, actrice; traducteur, traductrice; musicien, musicienne.',
        translationEs: 'Actor, actriz; traductor, traductora; músico, música.',
        phoneticTip: 'Changement phonologique radical du suffixe: [jɛ̃] masculin devient [jɛn] féminin avec consonne [n] percutante.'
      }
    ]
  },
  {
    weekNumber: 21,
    title: 'Semaine 21: Fêtes Traditionnelles & Francophonie Mondiale',
    level: 'A2+ (CENNI 8)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 / B1 Passerelle',
    pda: 'Compara festividades tradicionales de países francófonos (Francia, Quebec, Senegal) con las tradiciones mexicanas.',
    lessons: [
      {
        id: 'fr-w21-l1',
        title: 'La Fête de la Musique et le Quatorze Juillet',
        target: 'Le quatorze juillet, le feu d\'artifice illumine la tour Eiffel au son de la Marseillaise.',
        translationEs: 'El 14 de julio, los fuegos artificiales iluminan la Torre Eiffel al son de la Marsellesa.',
        phoneticTip: 'Prononciation de "feu d\'artifice" [fø daʁtifis] et "Marseillaise" [maʁsɛjɛz].'
      },
      {
        id: 'fr-w21-l2',
        title: 'Traditions du Québec et d\'Afrique francophone',
        target: 'Au Québec, le Carnaval d\'hiver célèbre les sculptures sur glace au son des chansons folkloriques.',
        translationEs: 'En Quebec, el Carnaval de invierno celebra las esculturas en hielo al ritmo de canciones folclóricas.',
        phoneticTip: 'Accentuation québécoise et internationale dans le respect de la diversité de la Francophonie.'
      },
      {
        id: 'fr-w21-l3',
        title: 'Partager des festivités interculturelles',
        target: 'La diversité des cultures enrichit notre vision commune et fortifie les liens de fraternité.',
        translationEs: 'La diversidad de culturas enriquece nuestra visión común y fortalece los lazos de fraternidad.',
        phoneticTip: 'Rythme ternaire équilibré dans la phrase oratoire.'
      },
      {
        id: 'fr-w21-l4',
        title: 'Atelier Phonétique: Les voyelles ouvertes et fermées ([e] vs [ɛ], [o] vs [ɔ])',
        target: 'Le pré vert était très beau au bord de l\'eau.',
        translationEs: 'El prado verde era muy hermoso al borde del agua.',
        phoneticTip: 'Distinction acoustique précise entre le [e] fermé de "pré" et le [ɛ] ouvert de "vert/était".'
      }
    ]
  },
  {
    weekNumber: 22,
    title: 'Semaine 22: Projets de Vie, Prédictions & le Futur Simple',
    level: 'A2+ (CENNI 8)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 / B1 Passerelle',
    pda: 'Formula proyectos de vida académica y profesional utilizando el futur simple afirmativo y negativo con conectores temporales.',
    lessons: [
      {
        id: 'fr-w22-l1',
        title: 'Formation et emploi du futur simple',
        target: 'Dans cinq ans, nous finirons nos études et nous voyagerons dans toute l\'Europe.',
        translationEs: 'En cinco años, terminaremos nuestros estudios y viajaremos por toda Europa.',
        phoneticTip: 'Les terminaisons du futur simple (-ai, -as, -a, -ons, -ez, -ont) ont une voyelle [e] ou [ɔ̃] nette.'
      },
      {
        id: 'fr-w22-l2',
        title: 'Prédictions scientifiques et climatiques',
        target: 'Les scientifiques affirment que la technologie solaire deviendra la principale source d\'énergie.',
        translationEs: 'Los científicos afirman que la tecnología solar se convertirá en la principal fuente de energía.',
        phoneticTip: 'Verbe irrégulier au futur: "deviendra" [dəvjɛ̃dʁa] avec racine en "viendr-".'
      },
      {
        id: 'fr-w22-l3',
        title: 'Engagements personnels et résolutions',
        target: 'Je m\'engagerai résolument dans des projets associatifs pour soutenir les élèves en difficulté.',
        translationEs: 'Me comprometeré resueltamente en proyectos comunitarios para apoyar a los alumnos en dificultad.',
        phoneticTip: 'Prononciation de "m\'engagerai" [mɑ̃ɡaʒʁe] avec élision du "e" muet intérieur.'
      },
      {
        id: 'fr-w22-l4',
        title: 'Atelier Phonétique: Le son [ʁ] en groupe consonantique complexe (tr-, dr-, pr-, br-)',
        target: 'Notre grand train traversera très promptement les trois frontières.',
        translationEs: 'Nuestro gran tren atravesará muy prontamente las tres fronteras.',
        phoneticTip: 'Assouplir la gorge pour laisser passer le flux d\'air consonantique sans bloquer la sonorité.'
      }
    ]
  },
  {
    weekNumber: 23,
    title: 'Semaine 23: Règles, Devoirs Citoyens & Vie en Collectivité',
    level: 'A2+ (CENNI 9)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 - France Éducation International',
    pda: 'Comprende el reglamento escolar, formula obligaciones y prohibiciones utilizando il faut / il est interdit de / devoir.',
    lessons: [
      {
        id: 'fr-w23-l1',
        title: 'Le règlement intérieur du collège',
        target: 'Les élèves doivent respecter les horaires et éteindre leurs téléphones portables en classe.',
        translationEs: 'Los alumnos deben respetar los horarios y apagar sus teléfonos celulares en clase.',
        phoneticTip: 'Terminaison verbale muette "-ent" dans "doivent" [dwav].'
      },
      {
        id: 'fr-w23-l2',
        title: 'L\'interdiction stricte et la bienséance',
        target: 'Il est strictement interdit de dégrader le mobilier public et les espaces verts collectifs.',
        translationEs: 'Está estrictamente prohibido dañar el mobiliario público y las áreas verdes colectivas.',
        phoneticTip: 'Prononciation de "strictement" [stʁiktəmɑ̃] et "interdit" [ɛ̃tɛʁdi] avec "t" muet.'
      },
      {
        id: 'fr-w23-l3',
        title: 'Les droits et responsabilités civiques',
        target: 'Chaque citoyen a le droit d\'exprimer son opinion dans le respect d\'autrui.',
        translationEs: 'Cada ciudadano tiene el derecho de expresar su opinión dentro del respeto a los demás.',
        phoneticTip: 'Prononciation de "d\'autrui" [dotʁɥi] avec semi-voyelle [ɥ].'
      },
      {
        id: 'fr-w23-l4',
        title: 'Atelier Phonétique: L\'intonation impérative ferme mais bienveillante',
        target: 'Soyez ponctuels, écoutez attentivement et participez activement au cours!',
        translationEs: '¡Sean puntuales, escuchen atentamente y participen activamente en la clase!',
        phoneticTip: 'Rythme régulier impératif sans crier, avec projection vocale posée.'
      }
    ]
  },
  {
    weekNumber: 24,
    title: 'Semaine 24: Comparaisons, Préférences & Avis Consommateurs',
    level: 'A2+ (CENNI 9)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 - France Éducation International',
    pda: 'Compara servicios, dispositivos y hábitos cotidianos empleando el comparativo (plus... que, moins... que) y el superlativo.',
    lessons: [
      {
        id: 'fr-w24-l1',
        title: 'Le comparatif de supériorité, d\'infériorité et d\'égalité',
        target: 'Le vélo est plus écologique que la voiture, et le train est aussi rapide que l\'avion sur les trajets courts.',
        translationEs: 'La bicicleta es más ecológica que el coche, y el tren es tan rápido como el avión en trayectos cortos.',
        phoneticTip: 'Prononciation de "plus" [ply] devant consonne et [plys] en fin de phrase ou en insistance.'
      },
      {
        id: 'fr-w24-l2',
        title: 'Le superlativo absolu et relatif',
        target: 'Le Mont Blanc est le plus haut sommet des Alpes françaises et attire des alpinistes du monde entier.',
        translationEs: 'El Mont Blanc es la cumbre más alta de los Alpes franceses y atrae a alpinistas de todo el mundo.',
        phoneticTip: 'Liaison dans "plus_haut" [ply o] interdite à cause du "h" aspiré de "haut"!'
      },
      {
        id: 'fr-w24-l3',
        title: 'Rédiger un avis critique sur un service',
        target: 'Ce service de livraison est bien meilleur que le précédent: rapidité exemplaire et emballage soigné.',
        translationEs: 'Este servicio de entrega es mucho mejor que el anterior: rapidez ejemplar y empaque cuidado.',
        phoneticTip: 'Forme irrégulière "meilleur" (adjectif) vs "mieux" (adverbe).'
      },
      {
        id: 'fr-w24-l4',
        title: 'Atelier Phonétique: Le "H" muet vs le "H" aspiré en français',
        target: 'L\'homme, l\'hôtel (H muet: élision); Le héros, le haut (H aspiré: pas d\'élision ni de liaison).',
        translationEs: 'El hombre, el hotel (H muda: hay elisión); El héroe, lo alto (H aspirada: prohibida elisión y enlace).',
        phoneticTip: 'Piège classique de certification: "le héros" [lə eʁo] ne devient JAMAIS "l\'héros".'
      }
    ]
  },
  {
    weekNumber: 25,
    title: 'Semaine 25: Contes, Légendes & Récits Littéraires Francophones',
    level: 'A2+ (CENNI 9)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 - France Éducation International',
    pda: 'Comprende fábulas y relatos tradicionales francófonos (La Fontaine, Perrault) articulando la alternancia imparfait / passé composé.',
    lessons: [
      {
        id: 'fr-w25-l1',
        title: 'L\'alternance Imparfait / Passé Composé dans le récit',
        target: 'Le ciel était sombre et il pleuvait quand tout à coup un coup de tonnerre a éclaté.',
        translationEs: 'El cielo estaba oscuro y llovía cuando de repente un trueno estalló.',
        phoneticTip: 'L\'imparfait peint le décor de fond, le passé composé marque l\'action ponctuelle soudaine.'
      },
      {
        id: 'fr-w25-l2',
        title: 'Les fables de La Fontaine et leur morale',
        target: 'Rien ne sert de courir; il faut partir à point, comme l\'enseigne la sage tortue.',
        translationEs: 'De nada sirve correr; hay que salir a tiempo, como enseña la sabia tortuga.',
        phoneticTip: 'Diction classique française de la versification poétique rimée.'
      },
      {
        id: 'fr-w25-l3',
        title: 'Légendes médiévales et héros légendaires',
        target: 'Le preux chevalier défendait son château fort avec bravoure et loyauté envers son peuple.',
        translationEs: 'El valiente caballero defendía su castillo con valentía y lealtad hacia su pueblo.',
        phoneticTip: 'Prononciation de "chevalier" [ʃəvalje] avec [e] fermé final.'
      },
      {
        id: 'fr-w25-l4',
        title: 'Atelier Phonétique: L\'art du conteur: débit, silences dramatiques et intonation narrative',
        target: 'Il était une fois, au cœur d\'une forêt millénaire, un château mystérieux.',
        translationEs: 'Había una vez, en el corazón de un bosque milenario, un castillo misterioso.',
        phoneticTip: 'Variation de tempo: ralentir sur les passages d\'atmosphère et accélérer lors des péripéties.'
      }
    ]
  },
  {
    weekNumber: 26,
    title: 'Semaine 26: Évaluation du Trimestre 2 & Simulacre Officiel DELF A2',
    level: 'A2+ (CENNI 9)',
    cefr: 'A2+',
    trimester: 2,
    certificationTarget: 'DELF Junior A2 Diplôme Officiel Validé - France Éducation International',
    pda: 'Resuelve un examen de certificación oficial DELF A2 simulado demostrando comprensión lectora, redacción y expresión oral continua.',
    lessons: [
      {
        id: 'fr-w26-l1',
        title: 'Épreuve Orale DELF A2 Partie 1: Entretien dirigé approfondi',
        target: 'J\'habite dans une belle ville mexicaine et ma passion principale est la programmation informatique.',
        translationEs: 'Vivo en una hermosa ciudad mexicana y mi principal pasión es la programación informática.',
        phoneticTip: 'Réponses complètes et articulées sans hésitations superflues.'
      },
      {
        id: 'fr-w26-l2',
        title: 'Épreuve Orale DELF A2 Partie 2: Monologue suivi avec préparation',
        target: 'Pendant mes dernières vacances, je suis parti explorer les pyramides préhispaniques avec mes camarades.',
        translationEs: 'Durante mis últimas vacaciones, fui a explorar las pirámides prehispánicas con mis compañeros.',
        phoneticTip: 'Discours continu de deux minutes avec cohérence chronologique et richesse lexicale A2.'
      },
      {
        id: 'fr-w26-l3',
        title: 'Épreuve Orale DELF A2 Partie 3: Exercice en interaction (situation imprévue)',
        target: 'Bonjour monsieur, je viens d\'acheter cet appareil électronique mais il ne fonctionne pas correctement.',
        translationEs: 'Buenos días señor, acabo de comprar este aparato electrónico pero no funciona correctamente.',
        phoneticTip: 'Réclamation polie mais ferme au service après-vente avec négociation d\'échange.'
      },
      {
        id: 'fr-w26-l4',
        title: 'Soutenance de Palier: Validation du Diplôme Intermédiaire A2',
        target: 'J\'ai franchi avec succès les exigences du niveau A2 et je me prépare pour le niveau d\'indépendance B1.',
        translationEs: 'He superado con éxito las exigencias del nivel A2 y me preparo para el nivel de independencia B1.',
        phoneticTip: 'Intonation académique assurée, projection vocale mature et fierté méritée.'
      }
    ]
  },

  // =========================================================================
  // TRIMESTRE 3: AUTONOMIE, DÉBAT, PENSÉE CRITIQUE & CERTIFICATION B1/B2
  // =========================================================================
  {
    weekNumber: 27,
    title: 'Semaine 27: Les Médias, l\'Information & l\'Esprit Critique',
    level: 'B1 (CENNI 10)',
    cefr: 'B1',
    trimester: 3,
    certificationTarget: 'DELF Junior B1 - France Éducation International',
    pda: 'Analiza notas periodísticas y reportajes en medios digitales franceses distinguiendo hechos comprobados de noticias falsas.',
    lessons: [
      {
        id: 'fr-w27-l1',
        title: 'La liberté de la presse et le rôle des journalistes',
        target: 'La presse libre constitue l\'un des piliers incontournables de la démocratie contemporaine.',
        translationEs: 'La prensa libre constituye uno de los pilares ineludibles de la democracia contemporánea.',
        phoneticTip: 'Prononciation de "incontournables" [ɛ̃kɔ̃tuʁnabl] avec les deux nasales antérieures et postérieures.'
      },
      {
        id: 'fr-w27-l2',
        title: 'Débusquer les fausses informations (infox / fake news)',
        target: 'Vérifier systématiquement la source originale permet d\'éviter la diffusion de rumeurs fallacieuses.',
        translationEs: 'Verificar sistemáticamente la fuente original permite evitar la difusión de rumores engañosos.',
        phoneticTip: 'Adverbe "systématiquement" prononcé avec rigueur métrique.'
      },
      {
        id: 'fr-w27-l3',
        title: 'Le débat télévisé et les connecteurs d\'opinion',
        target: 'À mon avis, le journalisme d\'investigation doit rester totalement indépendant des pouvoirs économiques.',
        translationEs: 'En mi opinión, el periodismo de investigación debe permanecer totalmente independiente de los poderes económicos.',
        phoneticTip: 'Formule d\'opinion "À mon avis..." avec montée expressive.'
      },
      {
        id: 'fr-w27-l4',
        title: 'Atelier Phonétique: L\'articulation des mots longs d\'origine journalistique',
        target: 'L\'investigation, la désinformation, l\'inconditionnel, la vérification.',
        translationEs: 'La investigación, la desinformación, lo incondicional, la verificación.',
        phoneticTip: 'Éviter de précipiter le débit: chaque syllabe compte également en langue française.'
      }
    ]
  },
  {
    weekNumber: 28,
    title: 'Semaine 28: La Science, les Grandes Découvertes & l\'Espace',
    level: 'B1 (CENNI 10)',
    cefr: 'B1',
    trimester: 3,
    certificationTarget: 'DELF Junior B1 - France Éducation International',
    pda: 'Describe hitos científicos mundiales utilizando la voz pasiva para destacar procesos, descubrimientos e innovaciones espaciales.',
    lessons: [
      {
        id: 'fr-w28-l1',
        title: 'Les vaccins et l\'héritage de Louis Pasteur',
        target: 'Le principe de la vaccination a été développé par Louis Pasteur au dix-neuvième siècle.',
        translationEs: 'El principio de la vacunación fue desarrollado por Louis Pasteur en el siglo XIX.',
        phoneticTip: 'Voix passive en français: accord du participe "développé" avec le sujet "le principe".'
      },
      {
        id: 'fr-w28-l2',
        title: 'L\'exploration spatiale et l\'astrophysique',
        target: 'Des télescopes de dernière génération sont déployés en orbite pour sonder les confins du cosmos.',
        translationEs: 'Telescopios de última generación están desplegados en órbita para sondear los confines del cosmos.',
        phoneticTip: 'Prononciation de "cosmos" [kɔsmɔs] avec le "s" final prononcé.'
      },
      {
        id: 'fr-w28-l3',
        title: 'La méthode scientifique et l\'expérimentation',
        target: 'Une théorie rigoureuse doit être validée par une série d\'expériences reproductibles en laboratoire.',
        translationEs: 'Una teoría rigurosa debe ser validada por una serie de experimentos reproducibles en laboratorio.',
        phoneticTip: 'Prononciation de "reproductibles" [ʁəpʁɔdyktibl] avec la séquence consonantique [kt].'
      },
      {
        id: 'fr-w28-l4',
        title: 'Atelier Phonétique: L\'enchaînement consonne-voyelle dans le lexique scientifique',
        target: 'Un astrophysicien éminent explore un astéroïde inconnu.',
        translationEs: 'Un astrofísico eminente explora un asteroide desconocido.',
        phoneticTip: 'Liaison et enchaînement continus sans rupture glottale: [œ̃n‿astʁɔfizisjɛ̃n‿eminɑ̃].'
      }
    ]
  },
  {
    weekNumber: 29,
    title: 'Semaine 29: Les Arts, le Cinéma & la Critique Culturelle',
    level: 'B1+ (CENNI 11)',
    cefr: 'B1+',
    trimester: 3,
    certificationTarget: 'DELF Junior B1 / B2 Passerelle',
    pda: 'Formula apreciaciones estéticas fundadas sobre filmes y obras de arte francófonas empleando el subjuntivo presente de opinión.',
    lessons: [
      {
        id: 'fr-w29-l1',
        title: 'La critique d\'un film primé au Festival de Cannes',
        target: 'La mise en scène est magistrale, bien que le scénario présente quelques longueurs au milieu du film.',
        translationEs: 'La puesta en escena es magistral, aunque el guion presenta algunas escenas lentas a la mitad de la película.',
        phoneticTip: 'Emploi du subjonctif après "bien que": "bien que le scénario présente..." [pʁezɑ̃t].'
      },
      {
        id: 'fr-w29-l2',
        title: 'L\'impressionnisme et les beaux-arts',
        target: 'Claude Monet a révolutionné la peinture en capturant les variations lumineuses sur la nature.',
        translationEs: 'Claude Monet revolucionó la pintura al capturar las variaciones luminosas sobre la naturaleza.',
        phoneticTip: 'Prononciation du gérondif "en capturant" [ɑ̃ kaptyʁɑ̃] marquant la manière.'
      },
      {
        id: 'fr-w29-l3',
        title: 'Le patrimoine muséal et l\'accès universel à la culture',
        target: 'Il est indispensable que chaque citoyen puisse accéder gratuitement aux musées nationaux.',
        translationEs: 'Es indispensable que cada ciudadano pueda acceder gratuitamente a los museos nacionales.',
        phoneticTip: 'Subjonctif irrégulier du verbe pouvoir: "qu\'il puisse" [pɥis].'
      },
      {
        id: 'fr-w29-l4',
        title: 'Atelier Phonétique: Les nuances vocales dans l\'éloge et la réserve critique',
        target: 'Un chef-d\'œuvre absolument sublime qui mérite amplement tous les éloges.',
        translationEs: 'Una obra de arte absolutamente sublime que merece con creces todos los elogios.',
        phoneticTip: 'Modulation expressive de la hauteur de voix pour valoriser l\'intensité de l\'admiration.'
      }
    ]
  },
  {
    weekNumber: 30,
    title: 'Semaine 30: Innovation Technologique, IA & Éthique du Travail',
    level: 'B2 (CENNI 13)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Analiza las implicaciones éticas y laborales de la inteligencia artificial y defiende posturas humanistas con vocabulario especializado.',
    lessons: [
      {
        id: 'fr-w30-l1',
        title: 'L\'éthique des algorithmes et la gouvernance numérique',
        target: 'Les retombées sociétales de l\'automatisation exigent une réglementation juridique rigoureuse et transparente.',
        translationEs: 'Las repercusiones sociales de la automatización exigen una regulación jurídica rigurosa y transparente.',
        phoneticTip: 'Articulation solennelle de "sociétales" [sɔsjetal] et "réglementation".'
      },
      {
        id: 'fr-w30-l2',
        title: 'Simulation d\'un colloque académique et prises de parole',
        target: 'Permettez-moi de nuancer cette affirmation catégorique en apportant des données statistiques probantes.',
        translationEs: 'Permítanme matizar esta afirmación categórica aportando datos estadísticos concluyentes.',
        phoneticTip: 'Élégance rhétorique française: "Permettez-moi de nuancer..." avec diction parfaite.'
      },
      {
        id: 'fr-w30-l3',
        title: 'La transformation des métiers et compétences futures',
        target: 'Loin d\'être un simple outil, la technologie redéfinit en profondeur la nature même du travail humain.',
        translationEs: 'Lejos de ser una simple herramienta, la tecnología redefine en profundidad la naturaleza misma del trabajo humano.',
        phoneticTip: 'Tournure concessive "Loin d\'être..." avec liaison douce.'
      },
      {
        id: 'fr-w30-l4',
        title: 'Atelier Phonétique: Débit oratoire rapide et liaisons savantes du registre soutenu',
        target: 'L\'esprit critique demeure le rempart suprême et inviolable de l\'humanité.',
        translationEs: 'El pensamiento crítico sigue siendo la muralla suprema e inviolable de la humanidad.',
        phoneticTip: 'Maîtrise du registre académique soutenu avec timbre de conférencier international.'
      }
    ]
  },
  {
    weekNumber: 31,
    title: 'Semaine 31: Citoyenneté Mondiale, Droits de l\'Homme & Diversité',
    level: 'B2 (CENNI 13)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Argumenta sobre la Declaración Universal de los Derechos Humanos, la laicidad republicana y la inclusión comunitaria en foros juveniles.',
    lessons: [
      {
        id: 'fr-w31-l1',
        title: 'La Déclaration des Droits de l\'Homme et du Citoyen',
        target: 'Les hommes naissent et demeurent libres et égaux en droits, sans distinction d\'origine.',
        translationEs: 'Los hombres nacen y permanecen libres e iguales en derechos, sin distinción de origen.',
        phoneticTip: 'Diction républicaine historique universelle issue du siècle des Lumières.'
      },
      {
        id: 'fr-w31-l2',
        title: 'La laïcité et le vivre-ensemble',
        target: 'Le principe de laïcité garantit la liberté de conscience et protège la neutralité républicaine.',
        translationEs: 'El principio de laicidad garantiza la libertad de conciencia y protege la neutralidad republicana.',
        phoneticTip: 'Prononciation de "laïcité" [laisite] avec tréma sonore sur le "i".'
      },
      {
        id: 'fr-w31-l3',
        title: 'Plaidoyer pour l\'inclusion et la solidarité internationale',
        target: 'Reconnaître la dignité inhérente à chaque être humain est la condition sine qua non de la paix.',
        translationEs: 'Reconocer la dignidad inherente a cada ser humano es la condición sine qua non de la paz.',
        phoneticTip: 'Locution latine intégrée "sine qua non" [sine kwa nɔn] avec prononciation francisée.'
      },
      {
        id: 'fr-w31-l4',
        title: 'Atelier Phonétique: L\'éloquence humaniste: souffle, projection et conviction',
        target: 'Ensemble, édifions un monde fondé sur la justice, la tolérance et la solidarité.',
        translationEs: 'Juntos, edifiquemos un mundo fundado en la justicia, la tolerancia y la solidaridad.',
        phoneticTip: 'Portée de voix plénière, amplitude thoracique et clarté de chaque fin de phrase.'
      }
    ]
  },
  {
    weekNumber: 32,
    title: 'Semaine 32: L\'Art du Débat, Argumentation & Réfutation',
    level: 'B2 (CENNI 13)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Estructura una argumentación dialéctica formal (tesis, antítesis, síntesis) y refuta argumentos opuestos en debates de elocuencia.',
    lessons: [
      {
        id: 'fr-w32-l1',
        title: 'La structure thèse, antithèse et synthèse',
        target: 'S\'il est indéniable que le progrès apporte du confort, force est de constater qu\'il engendre des disparités.',
        translationEs: 'Si bien es innegable que el progreso aporta comodidad, es forzoso constatar que genera desigualdades.',
        phoneticTip: 'Tournure idiomatique dialectique "force est de constater que..." [fɔʁs ɛ də kɔ̃state kə].'
      },
      {
        id: 'fr-w32-l2',
        title: 'La concession stratégique et la réfutation',
        target: 'Bien que votre proposition paraisse séduisante de prime abord, elle se heurte à des obstacles majeurs.',
        translationEs: 'Aunque su propuesta parezca atractiva a primera vista, choca con obstáculos mayúsculos.',
        phoneticTip: 'Emploi du subjonctif concessif et liaison "à des_obstacles" [a dez‿ɔbstakl].'
      },
      {
        id: 'fr-w32-l3',
        title: 'Les connecteurs argumentatifs de haut niveau',
        target: 'D\'une part, nous consolidons nos acquis; d\'autre part, nous ouvrons de nouvelles perspectives prometteuses.',
        translationEs: 'Por una parte, consolidamos nuestros logros; por otra parte, abrimos nuevas perspectivas prometedoras.',
        phoneticTip: 'Parallélisme rythmique rigoureux entre "D\'une part" et "D\'autre part".'
      },
      {
        id: 'fr-w32-l4',
        title: 'Atelier Phonétique: Le débit modulé lors d\'un concours d\'éloquence',
        target: 'Messieurs les jurés, c\'est au nom de l\'avenir que nous sollicitons votre bienveillante adhésion.',
        translationEs: 'Señores del jurado, es en nombre del porvenir que solicitamos su amable adhesión.',
        phoneticTip: 'Pausa de silencio de un segundo antes del argumento decisivo para cautivar a la audiencia.'
      }
    ]
  },
  {
    weekNumber: 33,
    title: 'Semaine 33: Urbanisme Durable, Écoquartiers & Villes Intelligentes',
    level: 'B2 (CENNI 13)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Diseña y sustenta un proyecto de ecobarrio residencial con criterios de eficiencia energética y movilidad blanda en francés.',
    lessons: [
      {
        id: 'fr-w33-l1',
        title: 'Les écoquartiers et la transition écologique urbaine',
        target: 'Ce projet pilote intègre des toitures végétalisées et des systèmes de récupération des eaux pluviales.',
        translationEs: 'Este proyecto piloto integra techos verdes y sistemas de captación de aguas pluviales.',
        phoneticTip: 'Prononciation de "végétalisées" [veʒetalize] et "pluviales" [plyvjal].'
      },
      {
        id: 'fr-w33-l2',
        title: 'La mobilité douce et les transports propres',
        target: 'Favoriser les pistes cyclables protégées et les zones piétonnes assainit considérablement l\'air des métropoles.',
        translationEs: 'Favorecer las ciclovías protegidas y las zonas peatonales limpia considerablemente el aire de las metrópolis.',
        phoneticTip: 'Verbe "assainir" [asɛniʁ] avec diphtongue ouverte [ɛ].'
      },
      {
        id: 'fr-w33-l3',
        title: 'Présenter un dossier d\'aménagement au conseil municipal',
        target: 'Nous recommandons vivement l\'aménagement d\'un parc arboré de trois hectares en cœur de ville.',
        translationEs: 'Recomendamos ampliamente el acondicionamiento de un parque arbolado de tres hectáreas en pleno centro.',
        phoneticTip: 'Prononciation de "trois hectares" [tʁwaz‿ɛktaʁ] avec liaison en [z] sur le "h" muet.'
      },
      {
        id: 'fr-w33-l4',
        title: 'Atelier Phonétique: La clarté lexicale des termes techniques d\'urbanisme',
        target: 'Bioclimatique, permaculture, intermodalité, piétonnisation.',
        translationEs: 'Bioclimático, permacultura, intermodalidad, peatonalización.',
        phoneticTip: 'Scansion égale et détachée des syllabes des néologismes techniques contemporains.'
      }
    ]
  },
  {
    weekNumber: 34,
    title: 'Semaine 34: Psychologie, Écoute Active & Relations Humaines',
    level: 'B2 (CENNI 13)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Analiza conceptos de comunicación no violenta, mediación de conflictos interpersonales e inteligencia emocional en lengua francesa.',
    lessons: [
      {
        id: 'fr-w34-l1',
        title: 'La communication bienveillante et l\'empathie',
        target: 'Exprimer ses besoins légitimes sans agressivité verbale désamorce les tensions interpersonnelles.',
        translationEs: 'Expresar sus necesidades legítimas sin agresividad verbal desactiva las tensiones interpersonales.',
        phoneticTip: 'Verbe "désamorcer" [dezamɔʁse] avec préfixe "dés-" doux.'
      },
      {
        id: 'fr-w34-l2',
        title: 'La médiation scolaire par les pairs',
        target: 'Le rôle du médiateur consiste à écouter impartialement chaque partie afin de rétablir le dialogue.',
        translationEs: 'El papel del mediador consiste en escuchar imparcialmente a cada parte con el fin de restablecer el diálogo.',
        phoneticTip: 'Adverbe "impartialement" [ɛ̃paʁsjalmɑ̃] avec les deux nasales.'
      },
      {
        id: 'fr-w34-l3',
        title: 'L\'intelligence émotionnelle et le leadership',
        target: 'La capacité à réguler ses propres émotions favorise une prise de décision éclairée et sereine.',
        translationEs: 'La capacidad de regular las propias emociones favorece una toma de decisiones informada y serena.',
        phoneticTip: 'Prononciation de "éclairée" [eklɛʁe] avec diphtongue ouverte suivie de voyelle fermée.'
      },
      {
        id: 'fr-w34-l4',
        title: 'Atelier Phonétique: La voix posée et rassurante dans la médiation',
        target: 'Prenons le temps d\'analyser la situation avec sérénité et ouverture d\'esprit.',
        translationEs: 'Tomémonos el tiempo de analizar la situación con serenidad y apertura de mente.',
        phoneticTip: 'Baisse volontaire du registre aigu pour adopter une voix de poitrine rassurante.'
      }
    ]
  },
  {
    weekNumber: 35,
    title: 'Semaine 35: Économie Circulaire, Entrepreneuriat & Finances',
    level: 'B2 (CENNI 13)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Comprende balances financieros básicos, modelos de negocio social y sustenta una propuesta de emprendimiento en francés.',
    lessons: [
      {
        id: 'fr-w35-l1',
        title: 'L\'économie circulaire et le réemploi solidaire',
        target: 'L\'économie circulaire substitue au modèle linéaire traditionnel le recyclage et la valorisation continue.',
        translationEs: 'La economía circular sustituye el modelo lineal tradicional por el reciclaje y la valorización continua.',
        phoneticTip: 'Prononciation du verbe "substitue" [sypstity] avec consonne liquide.'
      },
      {
        id: 'fr-w35-l2',
        title: 'Créer une jeune pousse (startup) innovante',
        target: 'Notre entreprise à mission développe une application mobile facilitant le commerce équitable de proximité.',
        translationEs: 'Nuestra empresa con misión social desarrolla una aplicación móvil que facilita el comercio justo de proximidad.',
        phoneticTip: 'Terminologie officielle de l\'Académie française: "jeune pousse" pour startup.'
      },
      {
        id: 'fr-w35-l3',
        title: 'Défendre son plan d\'affaires (business plan)',
        target: 'Nous prévoyons un retour sur investissement à moyen terme avec une marge opérationnelle de vingt pour cent.',
        translationEs: 'Prevemos un retorno de inversión a mediano plazo con un margen operativo del veinte por ciento.',
        phoneticTip: 'Lecture fluide des chiffres en pourcentage: "vingt pour cent" [vɛ̃ puʁ sɑ̃].'
      },
      {
        id: 'fr-w35-l4',
        title: 'Atelier Phonétique: La précision articulatoire des grands nombres et pourcentages',
        target: 'Trois millions deux cent mille euros d\'excédent budgétaire annuel.',
        translationEs: 'Tres millones doscientos mil euros de superávit presupuestario anual.',
        phoneticTip: 'Liaison obligatoire: "deux_cent_mille_euros" [dø sɑ̃ mil øʁo].'
      }
    ]
  },
  {
    weekNumber: 36,
    title: 'Semaine 36: Situations Hypothétiques, Dilemmes & le Conditionnel',
    level: 'B2 (CENNI 13)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Argumenta sobre situaciones hipotéticas, dilemas bioéticos y escenarios contrafácticos empleando el conditionnel passé y las frases con si.',
    lessons: [
      {
        id: 'fr-w36-l1',
        title: 'L\'hypothèse sur le présent: "Si + Imparfait -> Conditionnel Présent"',
        target: 'Si j\'étais ministre de l\'Éducation, j\'encouragerais l\'apprentissage précoce de deux langues vivantes.',
        translationEs: 'Si fuera ministro de Educación, fomentaría el aprendizaje temprano de dos lenguas vivas.',
        phoneticTip: 'Structure hypothétique standard sans employer le conditionnel après le "si".'
      },
      {
        id: 'fr-w36-l2',
        title: 'Le regret et le reproche au conditionnel passé',
        target: 'Si nous avions anticipé cette crise, nous aurions pu éviter ces répercussions financières néfastes.',
        translationEs: 'Si hubiéramos anticipado esta crisis, habríamos podido evitar estas repercusiones financieras nefastas.',
        phoneticTip: 'Formation "Si + Plus-que-parfait -> Conditionnel passé": [si nuz‿avjɔ̃n‿ɑ̃tisipe].'
      },
      {
        id: 'fr-w36-l3',
        title: 'Dilemmes éthiques et nuances de probabilité',
        target: 'À supposer que cette hypothèse se confirme, les protocoles expérimentaux devraient être révisés.',
        translationEs: 'En el supuesto de que esta hipótesis se confirme, los protocolos experimentales tendrían que ser revisados.',
        phoneticTip: 'Locution conjonctive "À supposer que..." suivie obligatoirement du subjonctif.'
      },
      {
        id: 'fr-w36-l4',
        title: 'Atelier Phonétique: L\'accent d\'insistance sur les formes conditionnelles complexes',
        target: 'Nous aurions infiniment préféré que la décision fût prise de manière concertée.',
        translationEs: 'Habríamos preferido infinitamente que la decisión fuera tomada de manera concertada.',
        phoneticTip: 'Élégance du subjonctif imparfait du registre littéraire classique français.'
      }
    ]
  },
  {
    weekNumber: 37,
    title: 'Semaine 37: Correspondance Formelle, Lettres de Motivation & Synthèse',
    level: 'B2 (CENNI 14)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Redacta cartas formales de motivación para programas de becas y elabora síntesis argumentativas a partir de documentos múltiples.',
    lessons: [
      {
        id: 'fr-w37-l1',
        title: 'La lettre de motivation pour une bourse d\'excellence',
        target: 'Je sollicite par la présente votre bienveillance afin de postuler au programme de mobilité francophone.',
        translationEs: 'Solicito por medio de la presente su beneplácito con el fin de postular al programa de movilidad francófona.',
        phoneticTip: 'Formule épistolaire de haute tenue avec diction distinguée.'
      },
      {
        id: 'fr-w37-l2',
        title: 'La formule de salutation finale protocolaire',
        target: 'Je vous prie d\'agréer, madame la directrice, l\'expression de mes salutations les plus distinguées.',
        translationEs: 'Le ruego aceptar, señora directora, la expresión de mis saludos más distinguidos.',
        phoneticTip: 'Formule consacrée de la correspondance française sans abréviation.'
      },
      {
        id: 'fr-w37-l3',
        title: 'La synthèse méthodique de documents convergents',
        target: 'Les deux textes s\'accordent sur l\'urgence de préserver le multilinguisme dans les instances internationales.',
        translationEs: 'Los dos textos coinciden en la urgencia de preservar el multilingüismo en las instancias internacionales.',
        phoneticTip: 'Objectivité absolue du rédacteur: ne jamais utiliser le "je" dans une synthèse de documents.'
      },
      {
        id: 'fr-w37-l4',
        title: 'Atelier Phonétique: Le ton protocolaire de la diplomatie francophone',
        target: 'Distingués membres du comité de sélection, je vous remercie chaleureusement pour votre haute attention.',
        translationEs: 'Distinguidos miembros del comité de selección, les agradezco cálidamente por su distinguida atención.',
        phoneticTip: 'Cadence cérémonielle, débit mesuré et noblesse dans le timbre vocal.'
      }
    ]
  },
  {
    weekNumber: 38,
    title: 'Semaine 38: Mobilité Internationale & Entretiens Universitaires Campus France',
    level: 'B2 (CENNI 14)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 - France Éducation International',
    pda: 'Sustenta su proyecto académico y trayectoria extracurricular ante paneles de admisiones universitarias internacionales con soltura.',
    lessons: [
      {
        id: 'fr-w38-l1',
        title: 'Défendre son projet d\'études supérieures',
        target: 'Mon projet académique s\'articule autour de l\'ingénierie aérospatiale et de l\'intelligence artificielle responsable.',
        translationEs: 'Mi proyecto académico se articula en torno a la ingeniería aeroespacial y la inteligencia artificial responsable.',
        phoneticTip: 'Verbe précis "s\'articule autour de..." avec articulation dynamique.'
      },
      {
        id: 'fr-w38-l2',
        title: 'Valoriser ses expériences d\'engagement citoyen',
        target: 'J\'ai animé des ateliers de soutien scolaire bénévole au sein de notre communauté éducative.',
        translationEs: 'He coordinado talleres de regularización escolar voluntaria dentro de nuestra comunidad educativa.',
        phoneticTip: 'Prononciation de "bénévole" [benevɔl] avec [e] fermé puis [ɔ] ouvert.'
      },
      {
        id: 'fr-w38-l3',
        title: 'Répondre aux questions déstabilisantes du jury',
        target: 'Face à cette difficulté imprévue, j\'ai su faire preuve de flexibilité intellectuelle et de résilience.',
        translationEs: 'Frente a esta dificultad imprevista, supe demostrar flexibilidad intelectual y resiliencia.',
        phoneticTip: 'Maîtrise de soi émotionnelle et timbre vocal inébranlable.'
      },
      {
        id: 'fr-w38-l4',
        title: 'Atelier Phonétique: Gestion du trac, du souffle et de l\'assise corporelle',
        target: 'Ma motivation est totale et je suis prêt à m\'investir pleinement dans cette aventure académique.',
        translationEs: 'Mi motivación es total y estoy listo para comprometerme plenamente en esta aventura académica.',
        phoneticTip: 'Ancrage au sol, respiration ventrale profonde et conviction communicative.'
      }
    ]
  },
  {
    weekNumber: 39,
    title: 'Semaine 39: Phonétique Supérieure, Maîtrise Oratoire & Liaisons Savantes',
    level: 'B2+ (CENNI 14+)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 / DALF C1 Passerelle Supérieure',
    pda: 'Perfecciona los rasgos prosódicos finos del francés: cadencia del grupo rítmico, elisión poética, entonación oratoria y fonética orquestada.',
    lessons: [
      {
        id: 'fr-w39-l1',
        title: 'Les liaisons facultatives du haut discours républicain',
        target: 'Ils sont_allés / C\'est_un honneur / Nous avons_accompli de grands_exploits mémorables.',
        translationEs: 'Han ido / Es un honor / Hemos logrado grandes hazañas memorables.',
        phoneticTip: 'Maîtrise des liaisons savantes après les formes du verbe être et avoir qui distinguent le locuteur raffiné.'
      },
      {
        id: 'fr-w39-l2',
        title: 'Le "E" muet stylistique et l\'élision caduque',
        target: 'Je te le dis franchement: la persévérance quotidienne transforme le talent en maîtrise absolue.',
        translationEs: 'Te lo digo con franqueza: la perseverancia diaria transforma el talento en maestría absoluta.',
        phoneticTip: 'Loi des trois consonnes pour la chute du "e" caduc sans affecter la fluidité.'
      },
      {
        id: 'fr-w39-l3',
        title: 'L\'accent oratoire et la figure de style ternaire',
        target: 'Apprendre avec rigueur, comprendre avec profondeur, transmettre avec générosité.',
        translationEs: 'Aprender con rigor, comprender con profundidad, transmitir con generosidad.',
        phoneticTip: 'Rythme ternaire français traditionnel avec montée mélodique sur les deux premiers et résolution majestueuse sur le troisième.'
      },
      {
        id: 'fr-w39-l4',
        title: 'Atelier Phonétique: L\'articulation irréprochable et la clarté acoustique absolue',
        target: 'La langue française se distingue par son équilibre parfait entre rigueur logique et élégance poétique.',
        translationEs: 'La lengua francesa se distingue por su equilibrio perfecto entre rigor lógico y elegancia poética.',
        phoneticTip: 'Détente maxillaire et résonance dans les cavités crâniennes pour un son cristallin.'
      }
    ]
  },
  {
    weekNumber: 40,
    title: 'Semaine 40: Examen Blanc Officiel & Soutenance Finale DELF B2',
    level: 'B2 (CENNI 14)',
    cefr: 'B2',
    trimester: 3,
    certificationTarget: 'DELF Junior B2 Diplôme Officiel d\'État Validé - France Éducation International',
    pda: 'Acredita la competencia lingüística plena en las cuatro macrohabilidades mediante el examen oficial simulado de egreso con estándares internacionales.',
    lessons: [
      {
        id: 'fr-w40-l1',
        title: 'Épreuve Orale DELF B2: Exposé argumenté continu (défense d\'un point de vue)',
        target: 'À la lecture de ce dossier, il convient de s\'interroger sur l\'impact réel du numérique sur l\'autonomie des jeunes apprenants.',
        translationEs: 'Tras la lectura de este expediente, conviene cuestionarse sobre el impacto real de lo digital en la autonomía de los jóvenes aprendices.',
        phoneticTip: 'Exposé magistral de dix minutes avec problématique, plan articulé et exemples contrastés.'
      },
      {
        id: 'fr-w40-l2',
        title: 'Épreuve Orale DELF B2: Débat contradictoire avec le jury d\'examen',
        target: 'Je partage votre souci d\'efficacité, mais permettez-moi de souligner que la dimension humaine ne saurait être négligée.',
        translationEs: 'Comparto su preocupación por la eficacia, pero permítame subrayar que la dimensión humana no podría descuidarse.',
        phoneticTip: 'Répartie vive, courtoise et percutante face aux objections délibérées des examinateurs.'
      },
      {
        id: 'fr-w40-l3',
        title: 'Synthèse d\'écoute intégrale et compréhension orale complexe',
        target: 'L\'intervenant a démontré avec brio que l\'apprentissage bilingue précoce décuple la plasticité neuronale tout au long de l\'existence.',
        translationEs: 'El ponente demostró con brillo que el aprendizaje bilingüe temprano decuplica la plasticidad neuronal a lo largo de toda la existencia.',
        phoneticTip: 'Compréhension fine de documents radiophoniques authentiques rapides sans déformation du sens.'
      },
      {
        id: 'fr-w40-l4',
        title: 'Soutenance de Diplomation: Validation du Niveau B2 Indépendant International',
        target: 'Ayant validé l\'ensemble des quarante semaines de ce parcours d\'excellence, je me déclare certifié et prêt pour les études internationales.',
        translationEs: 'Habiendo acreditado el conjunto de las cuarenta semanas de este trayecto de excelencia, me declaro certificado y listo para los estudios internacionales.',
        phoneticTip: 'Déclaration solennelle finale avec port de tête royal, timbre affirmé et fierté d\'accomplissement.'
      }
    ]
  }
];
