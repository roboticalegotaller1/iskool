import {
  StudioBlock,
  ActivityBuilderMetadata,
  FlowConnection,
  HistoricalFigureBlockData,
  HistoricalFigureMoment,
  HistoricalKeyLocation,
  HistoricalVerificationQuestion,
} from '@/types/studioBlocks';

/**
 * Catálogo Multidisciplinario de Personajes y Sitios Históricos 3D (Bóveda Curricular)
 * Cumple estrictamente con REGLA NO NEGOCIABLE 2: Voz en 1ª Persona Estricta y Datos Verídicos.
 * Garantiza que el estudio NUNCA dependa de un solo personaje fijo.
 */
export const HISTORICAL_FIGURES_PRESET_CATALOG: HistoricalFigureBlockData[] = [
  {
    characterName: 'Miguel Hidalgo y Costilla',
    vaultNodeSlug: 'miguel_hidalgo_y_costilla',
    isGeographicSite: false,
    historicalEra: 'Inicio de la Independencia de México (1810 - 1811)',
    birthDeathDates: '1753 - 1811',
    shortBio: 'En la madrugada del 16 de septiembre de 1810 hice repicar las campanas de mi parroquia en Dolores para convocar al pueblo a luchar por su libertad y decreté en Guadalajara la abolición de la esclavitud.',
    detailedContext: 'Fui rector del Colegio de San Nicolás en Valladolid y párroco de Dolores, donde impulsé talleres de alfarería, sericicultura y herrería antes de encabezar el Ejército Insurgente.',
    avatarImageUrl: '/images/history/hidalgo_avatar.png',
    bookSpineStyle: 'diario_republicano',
    isFromVault: true,
    moments: [
      {
        id: 'hid-m1',
        title: 'El Llamado en la Parroquia de Dolores',
        yearOrDate: '16 de Septiembre de 1810',
        description: 'Al recibir el aviso urgente desde Querétaro por conducto de Ignacio Pérez y Juan Aldama, convoqué al pueblo en el atrio de mi parroquia en Dolores.',
        imageUrl: '/images/history/hidalgo_grito_comic_4.png',
        locationName: 'Parroquia de Nuestra Señora de los Dolores, Guanajuato',
        coordinates: { lat: 21.1561, lng: -100.9328 },
        narrativeCaption: '¡Hijos míos, ha llegado la hora de poner fin a tres siglos de opresión!'
      },
      {
        id: 'hid-m2',
        title: 'Toma de la Alhóndiga de Granaditas',
        yearOrDate: '28 de Septiembre de 1810',
        description: 'Junto a Ignacio Allende y el pueblo minero de Guanajuato, tomamos el bastión realista de la Alhóndiga de Granaditas.',
        imageUrl: '/images/history/alhondiga_granaditas.jpg',
        locationName: 'Alhóndiga de Granaditas, Guanajuato',
        coordinates: { lat: 21.0190, lng: -101.2574 },
        narrativeCaption: 'El valor del pueblo minero abrió las puertas de la primera gran victoria insurgente.'
      },
      {
        id: 'hid-m3',
        title: 'Victoria en el Monte de las Cruces',
        yearOrDate: '30 de Octubre de 1810',
        description: 'Con más de ochenta mil insurgentes derrotamos a las fuerzas realistas de Torcuato Trujillo a las puertas del Valle de México.',
        imageUrl: '/images/history/hidalgo_monte_cruces.jpg',
        locationName: 'Monte de las Cruces, Ocoyoacac',
        coordinates: { lat: 19.2995, lng: -99.3812 },
        narrativeCaption: 'En los bosques de las Cruces demostramos la fuerza imparable de una nación en marcha.'
      },
      {
        id: 'hid-m4',
        title: 'Decreto de Abolición de la Esclavitud',
        yearOrDate: '6 de Diciembre de 1810',
        description: 'Desde el Palacio de Gobierno de Guadalajara firmé el bando solemne que abolió la esclavitud y los tributos de castas en nuestra América.',
        imageUrl: '/images/history/hidalgo_decreto_abolicion.jpg',
        locationName: 'Palacio de Gobierno de Guadalajara, Jalisco',
        coordinates: { lat: 20.6767, lng: -103.3462 },
        narrativeCaption: 'Que todo ser humano sea libre por derecho natural en el suelo de nuestra patria.'
      }
    ],
    keyLocations: [
      {
        id: 'hid-loc1',
        name: 'Parroquia de Dolores Hidalgo',
        stateOrCountry: 'Guanajuato, México',
        coordinates: { lat: 21.1561, lng: -100.9328 },
        significance: 'Atrio histórico donde proclamé el inicio de la lucha por la Independencia la madrugada del 16 de septiembre de 1810.',
        imageUrl: '/images/history/parroquia_dolores.jpg'
      },
      {
        id: 'hid-loc2',
        name: 'Palacio de Gobierno de Guadalajara',
        stateOrCountry: 'Jalisco, México',
        coordinates: { lat: 20.6767, lng: -103.3462 },
        significance: 'Sede del gobierno insurgente donde promulgué el Decreto de Abolición de la Esclavitud el 6 de diciembre de 1810.',
        imageUrl: '/images/history/palacio_guadalajara.jpg'
      }
    ],
    videoClip: {
      videoUrl: 'https://www.youtube.com/watch?v=25cq1V8AsTg',
      durationSeconds: 15,
      title: 'El Llamado de Dolores y la Abolición de la Esclavitud',
      narratorScript: 'La madrugada del 16 de septiembre de 1810, convoqué al pueblo en Dolores y meses después decreté en Guadalajara la libertad absoluta de todos los esclavos.'
    },
    verificationQuestions: [
      {
        id: 'hid-vq1',
        question: '¿Qué decreto trascendental promulgué en Guadalajara el 6 de diciembre de 1810?',
        options: [
          'La Abolición de la Esclavitud y la supresión del pago de tributos de castas',
          'La instauración de una monarquía absoluta',
          'El Tratado de Córdoba',
          'El Plan de la Noria'
        ],
        correctIndex: 0,
        explanation: 'El 6 de diciembre de 1810 firmé en Guadalajara el bando que abolió la esclavitud y eliminó los tributos impuestos a las castas.'
      },
      {
        id: 'hid-vq2',
        question: '¿En qué población hice repicar la campana la madrugada del 16 de septiembre de 1810?',
        options: ['Dolores, Intendencia de Guanajuato', 'Puebla de los Ángeles', 'Veracruz', 'Mérida'],
        correctIndex: 0,
        explanation: 'Convoqué al pueblo desde el atrio de mi parroquia en Nuestra Señora de los Dolores, Guanajuato.'
      },
      {
        id: 'hid-vq3',
        question: '¿Qué oficios y artes impulsé entre los habitantes de Dolores antes del levantamiento armado?',
        options: [
          'Alfarería, sericicultura (cría de gusano de seda), curtiduría, herrería y cultivo de la vid',
          'Exclusivamente minería de plata para la Corona',
          'Comercio marítimo transatlántico',
          'Ninguna actividad productiva'
        ],
        correctIndex: 0,
        explanation: 'En Dolores fomenté talleres comunitarios de cerámica, seda, herrería, carpintería y cultivo de vid para dignificar el trabajo del pueblo.'
      }
    ]
  },
  {
    characterName: 'Josefa Ortiz de Domínguez',
    vaultNodeSlug: 'josefa_ortiz_de_dominguez',
    isGeographicSite: false,
    historicalEra: 'Guerra de Independencia de México (1810)',
    birthDeathDates: '1768 - 1829',
    shortBio: 'Di el aviso urgente desde mi alcoba en el Corregimiento de Querétaro la noche del 15 de septiembre de 1810, enviando a Ignacio Pérez a galope para alertar a Ignacio Allende y Miguel Hidalgo.',
    detailedContext: 'Nací en Valladolid (hoy Morelia) y me formé en el Colegio de las Vizcaínas. En mi casa de Querétaro organizamos las tertulias literarias donde trazamos el plan de emancipación nacional.',
    avatarImageUrl: '/images/history/josefa_ortiz_avatar.png',
    bookSpineStyle: 'diario_republicano',
    isFromVault: true,
    moments: [
      {
        id: 'jos-m1',
        title: 'Las Tertulias de Querétaro',
        yearOrDate: 'Septiembre de 1810',
        description: 'En mi casa del Corregimiento de Querétaro reuní a capitanes criollos y letrados para organizar el levantamiento por la soberanía nacional.',
        imageUrl: '/images/history/josefa_conspiracion_comic_1.png',
        locationName: 'Casa de la Corregidora, Santiago de Querétaro',
        coordinates: { lat: 20.5931, lng: -100.3928 },
        narrativeCaption: 'Bajo el velo de tertulias literarias forjamos la libertad de nuestra patria.'
      },
      {
        id: 'jos-m2',
        title: 'La Señal desde mi Alcoba',
        yearOrDate: '13 - 15 de Septiembre de 1810',
        description: 'Al ser descubierta nuestra conspiración y quedar encerrada bajo llave, golpeé el piso con mi tacón para llamar al alcaide Ignacio Pérez y confiarle el mensaje de alerta.',
        imageUrl: '/images/history/josefa_taconeo_comic_2.png',
        locationName: 'Casa del Corregimiento, Querétaro',
        coordinates: { lat: 20.5931, lng: -100.3928 },
        narrativeCaption: 'Ni los cerrojos realistas pudieron silenciar mi aviso por la libertad.'
      },
      {
        id: 'jos-m3',
        title: 'La Cabalgata Nocturna de Ignacio Pérez',
        yearOrDate: '15 de Septiembre de 1810',
        description: 'Por orden mía, el alcaide Ignacio Pérez cabalgó sin descanso en la oscuridad desde Querétaro hasta San Miguel el Grande y Dolores.',
        imageUrl: '/images/history/josefa_alerta_comic_3.png',
        locationName: 'Ruta Querétaro - San Miguel el Grande - Dolores',
        coordinates: { lat: 20.9144, lng: -100.7452 },
        narrativeCaption: 'Cada legua recorrida salvó la causa insurgente de ser sofocada antes de nacer.'
      },
      {
        id: 'jos-m4',
        title: 'Defensa de la República frente al Imperio',
        yearOrDate: '1822 - 1829',
        description: 'Tras consumarse la Independencia, rechacé el cargo de dama de honor de la corte imperial de Agustín de Iturbide porque mi convicción siempre fue republicana.',
        imageUrl: '/images/history/hidalgo_grito_comic_4.png',
        locationName: 'Ciudad de México / Querétaro',
        coordinates: { lat: 20.5975, lng: -100.3840 },
        narrativeCaption: 'Luché por una República de ciudadanos libres, jamás por una nueva corona.'
      }
    ],
    keyLocations: [
      {
        id: 'jos-loc1',
        name: 'Casa de la Corregidora (Palacio de Gobierno de Querétaro)',
        stateOrCountry: 'Querétaro, México',
        coordinates: { lat: 20.5931, lng: -100.3928 },
        significance: 'Recinto histórico donde organicé las juntas secretas de 1810 y desde donde envié el aviso decisivo.',
        imageUrl: '/images/history/casa_corregidora_queretaro.jpg'
      },
      {
        id: 'jos-loc2',
        name: 'Panteón de los Queretanos Ilustres',
        stateOrCountry: 'Querétaro, México',
        coordinates: { lat: 20.5975, lng: -100.3840 },
        significance: 'Mausoleo cívico donde reposan mis restos junto a los forjadores de la soberanía queretana.',
        imageUrl: '/images/history/panteon_queretanos_ilustres.jpg'
      }
    ],
    videoClip: {
      videoUrl: 'https://www.youtube.com/watch?v=25cq1V8AsTg',
      durationSeconds: 15,
      title: 'El Correo de la Libertad desde Querétaro',
      narratorScript: 'Encerrada en mi alcoba del Corregimiento de Querétaro, logré advertir a Ignacio Pérez para que cabalgara hacia San Miguel y Dolores la noche del 15 de septiembre de 1810.'
    },
    verificationQuestions: [
      {
        id: 'jos-vq1',
        question: '¿A quién envié a caballo desde Querétaro para advertir que la conspiración había sido descubierta?',
        options: ['Vicente Guerrero', 'Ignacio Pérez', 'Mariano Abasolo', 'Félix María Calleja'],
        correctIndex: 1,
        explanation: 'Confié el mensaje urgente al alcaide Ignacio Pérez, quien cabalgó hasta San Miguel el Grande y Dolores.'
      },
      {
        id: 'jos-vq2',
        question: '¿Por qué rechacé los honores de dama de la corte que me ofreció Agustín de Iturbide en 1822?',
        options: [
          'Porque defendí firmemente los ideales de una República soberana y no de un Imperio',
          'Porque deseaba regresar al dominio virreinal',
          'Por residir fuera del continente',
          'Porque no participé en política'
        ],
        correctIndex: 0,
        explanation: 'Me negué a recibir honores imperiales porque eran contrarios a los ideales republicanos y de igualdad por los que arriesgué mi vida.'
      }
    ]
  },
  {
    characterName: 'José María Morelos y Pavón',
    vaultNodeSlug: 'jose_maria_morelos_y_pavon',
    isGeographicSite: false,
    historicalEra: 'Etapa de Organización de la Independencia (1811 - 1815)',
    birthDeathDates: '1765 - 1815',
    shortBio: 'Asumí el mando del sur por encargo de mi maestro Miguel Hidalgo, rompí el Sitio de Cuautla y proclamé en Chilpancingo los Sentimientos de la Nación el 14 de septiembre de 1813.',
    detailedContext: 'Nací en Valladolid (hoy Morelia). Rechacé el título de Alteza Serenísima para llamarme Siervo de la Nación e impulsé la Constitución de Apatzingán de 1814.',
    avatarImageUrl: '/images/history/morelos_avatar.png',
    bookSpineStyle: 'tomo_imperial',
    isFromVault: true,
    moments: [
      {
        id: 'mor-m1',
        title: 'El Rompimiento del Sitio de Cuautla',
        yearOrDate: '2 de Mayo de 1812',
        description: 'Durante 72 días resistimos el asedio de Félix María Calleja en Cuautla hasta romper el cerco con estrategia militar.',
        imageUrl: '/images/history/morelos_sitio_cuautla.jpg',
        locationName: 'Cuautla, Morelos',
        coordinates: { lat: 18.8122, lng: -98.9553 },
        narrativeCaption: 'En Cuautla demostramos que la disciplina insurgente podía vencer al ejército virreinal.'
      },
      {
        id: 'mor-m2',
        title: 'Proclamación de los Sentimientos de la Nación',
        yearOrDate: '14 de Septiembre de 1813',
        description: 'Al inaugurar el Congreso de Anáhuac en Chilpancingo presenté los 23 puntos de los Sentimientos de la Nación: soberanía popular, división de poderes y moderación de la opulencia y la indigencia.',
        imageUrl: '/images/history/morelos_sentimientos_nacion.jpg',
        locationName: 'Catedral de la Asunción, Chilpancingo, Guerrero',
        coordinates: { lat: 17.5515, lng: -99.5006 },
        narrativeCaption: 'Que la esclavitud se proscriba para siempre y la ley sea igual para todos.'
      },
      {
        id: 'mor-m3',
        title: 'Constitución de Apatzingán',
        yearOrDate: '22 de Octubre de 1814',
        description: 'Promulgamos el Decreto Constitucional para la Libertad de la América Mexicana en Apatzingán, estableciendo los tres poderes republicanos.',
        imageUrl: '/images/history/morelos_constitucion_apatzingan.jpg',
        locationName: 'Apatzingán de la Constitución, Michoacán',
        coordinates: { lat: 19.0886, lng: -102.3508 },
        narrativeCaption: 'La primera carta magna de nuestra América libre nació en plena campaña.'
      },
      {
        id: 'mor-m4',
        title: 'Sacrificio en San Cristóbal Ecatepec',
        yearOrDate: '22 de Diciembre de 1815',
        description: 'Por proteger la retirada del Congreso Nacional fui capturado en Temalaca y fusilado en San Cristóbal Ecatepec con la certeza de haber sembrado la patria.',
        imageUrl: '/images/history/morelos_ecatepec_martirio.jpg',
        locationName: 'Casa de Morelos, San Cristóbal Ecatepec',
        coordinates: { lat: 19.5997, lng: -99.0494 },
        narrativeCaption: 'Morir es nada cuando por la patria se muere.'
      }
    ],
    keyLocations: [
      {
        id: 'mor-loc1',
        name: 'Chilpancingo de los Bravo',
        stateOrCountry: 'Guerrero, México',
        coordinates: { lat: 17.5515, lng: -99.5006 },
        significance: 'Sede del Primer Congreso de Anáhuac donde di lectura a los Sentimientos de la Nación en 1813.',
        imageUrl: '/images/history/morelos_sentimientos_nacion.jpg'
      }
    ],
    videoClip: {
      videoUrl: 'https://www.youtube.com/watch?v=25cq1V8AsTg',
      durationSeconds: 15,
      title: 'Los Sentimientos de la Nación y el Siervo de la Patria',
      narratorScript: 'En Chilpancingo proclamé los Sentimientos de la Nación para moderar la opulencia y la indigencia y establecer que la soberanía dimana directamente del pueblo.'
    },
    verificationQuestions: [
      {
        id: 'mor-vq1',
        question: '¿Qué documento fundamental presenté ante el Congreso de Chilpancingo el 14 de septiembre de 1813?',
        options: ['Los Sentimientos de la Nación', 'El Plan de Iguala', 'Las Siete Leyes', 'El Plan de Ayala'],
        correctIndex: 0,
        explanation: 'Presenté los Sentimientos de la Nación, base del constitucionalismo social mexicano.'
      }
    ]
  },
  {
    characterName: 'Benito Juárez García',
    vaultNodeSlug: 'benito_juarez',
    isGeographicSite: false,
    historicalEra: 'La Reforma y la República Restaurada (1855 - 1872)',
    birthDeathDates: '1806 - 1872',
    shortBio: 'Nací en San Pablo Guelatao, Oaxaca. Promulgué las Leyes de Reforma, defendí la soberanía nacional frente a la Intervención Francesa y restauré la República en 1867.',
    detailedContext: 'Como presidente de la Suprema Corte y luego Presidente de la República sostuve la legalidad constitucional en medio de la guerra civil y la invasión extranjera.',
    avatarImageUrl: '/images/history/benito_juarez_avatar.png',
    bookSpineStyle: 'diario_republicano',
    isFromVault: true,
    moments: [
      {
        id: 'jua-m1',
        title: 'Promulgación de la Ley Juárez',
        yearOrDate: '23 de Noviembre de 1855',
        description: 'Suprimí los fueros especiales militares y eclesiásticos en materia civil para instaurar la igualdad de todos los ciudadanos ante la ley.',
        imageUrl: '/images/history/juarez_ley_juarez_1855.jpg',
        locationName: 'Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        narrativeCaption: 'Ningún privilegio puede estar por encima de la igualdad republicana.'
      },
      {
        id: 'jua-m2',
        title: 'Las Leyes de Reforma desde Veracruz',
        yearOrDate: 'Julio de 1859',
        description: 'Desde el puerto de Veracruz expedí las Leyes de Reforma estableciendo el Estado laico, el Registro Civil y la libertad de cultos.',
        imageUrl: '/images/history/juarez_leyes_reforma_veracruz.jpg',
        locationName: 'Heroica Veracruz, Veracruz',
        coordinates: { lat: 19.1997, lng: -96.1342 },
        narrativeCaption: 'Separamos los negocios del Estado de los asuntos eclesiásticos para consolidar la libertad civil.'
      },
      {
        id: 'jua-m3',
        title: 'La República Itinerante en Paso del Norte',
        yearOrDate: '1865 - 1866',
        description: 'Llevé los poderes de la República en mi carruaje hasta Paso del Norte (hoy Ciudad Juárez) sin ceder un palmo de soberanía ante el imperio invasor.',
        imageUrl: '/images/history/juarez_carruaje_paso_del_norte.jpg',
        locationName: 'Paso del Norte (Ciudad Juárez), Chihuahua',
        coordinates: { lat: 31.7386, lng: -106.4850 },
        narrativeCaption: 'Donde estuvo el gobierno constitucional, ahí permaneció viva la República.'
      },
      {
        id: 'jua-m4',
        title: 'Triunfo y Restauración de la República',
        yearOrDate: '15 de Julio de 1867',
        description: 'Al ingresar triunfalmente a la Ciudad de México proclamé el principio inmortal: Entre los individuos, como entre las naciones, el respeto al derecho ajeno es la paz.',
        imageUrl: '/images/history/juarez_entrada_triunfal_1867.jpg',
        locationName: 'Palacio Nacional, Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        narrativeCaption: 'El pueblo y el gobierno respeten los derechos de todos.'
      }
    ],
    keyLocations: [
      {
        id: 'jua-loc1',
        name: 'Cerro de las Campanas',
        stateOrCountry: 'Querétaro, México',
        coordinates: { lat: 20.5939, lng: -100.4100 },
        significance: 'Sitio donde triunfaron las armas republicanas en mayo de 1867 poniendo fin al Segundo Imperio.',
        imageUrl: '/images/history/cerro_campanas_juarez.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'jua-vq1',
        question: '¿Cuál es el apotegma universal que proclamé al restaurar la República el 15 de julio de 1867?',
        options: [
          'Entre los individuos, como entre las naciones, el respeto al derecho ajeno es la paz',
          'Sufragio efectivo, no reelección',
          'La tierra es de quien la trabaja',
          'La patria es primero'
        ],
        correctIndex: 0,
        explanation: 'En mi manifiesto del 15 de julio de 1867 sinteticé la doctrina mexicana de soberanía y paz internacional.'
      }
    ]
  },
  {
    characterName: 'Sor Juana Inés de la Cruz',
    vaultNodeSlug: 'sor_juana_ines_de_la_cruz',
    isGeographicSite: false,
    historicalEra: 'Siglo de Oro y Barroco Novohispano (1648 - 1695)',
    birthDeathDates: '1648 - 1695',
    shortBio: 'Nací en San Miguel Nepantla. Desde mi biblioteca en el Convento de San Jerónimo escribí Primero Sueño y la Respuesta a Sor Filotea de la Cruz defendiendo el derecho de las mujeres a la ciencia y las letras.',
    detailedContext: 'Aprendí a leer a los tres años en la biblioteca de mi abuelo en Panoayan y superé el examen de cuarenta sabios universitarios en la corte virreinal.',
    avatarImageUrl: '/images/history/sor_juana_avatar.png',
    bookSpineStyle: 'grimorio_dorado',
    isFromVault: true,
    moments: [
      {
        id: 'sor-m1',
        title: 'El Examen ante los Cuarenta Sabios',
        yearOrDate: '1665',
        description: 'En el palacio virreinal respondí a cuarenta doctores y teólogos de la Real Universidad sobre filosofía, matemáticas, historia y poética.',
        imageUrl: '/images/history/sor_juana_examen_sabios.jpg',
        locationName: 'Palacio Virreinal, Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        narrativeCaption: 'Se defendió mi entendimiento como un galeón real ante cuarenta chalupas.'
      },
      {
        id: 'sor-m2',
        title: 'Composición de Primero Sueño',
        yearOrDate: '1685 - 1692',
        description: 'Escribí en silvas mi poema filosófico Primero Sueño, el único que compuse por propio gusto siguiendo el vuelo libre del alma hacia el conocimiento.',
        imageUrl: '/images/history/sor_juana_primero_sueno.jpg',
        locationName: 'Convento de San Jerónimo, Ciudad de México',
        coordinates: { lat: 19.4267, lng: -99.1375 },
        narrativeCaption: 'Piramidal, funesta, de la tierra nacida sombra...'
      },
      {
        id: 'sor-m3',
        title: 'Respuesta a Sor Filotea de la Cruz',
        yearOrDate: '1 de Marzo de 1691',
        description: 'Redacté mi defensa intelectual reivindicando el derecho universal de las mujeres al estudio, la filosofía y la investigación científica.',
        imageUrl: '/images/history/sor_juana_respuesta_filotea.jpg',
        locationName: 'Celda del Convento de San Jerónimo, Ciudad de México',
        coordinates: { lat: 19.4267, lng: -99.1375 },
        narrativeCaption: 'Yo no estudio para escribir, ni menos para enseñar, sino sólo por ver si con estudiar ignoro menos.'
      },
      {
        id: 'sor-m4',
        title: 'Solidaridad en la Epidemia de 1695',
        yearOrDate: '17 de Abril de 1695',
        description: 'Cuidando a mis hermanas enfermas durante la epidemia de cocoliztli en San Jerónimo entregué mi vida fiel a mi vocación.',
        imageUrl: '/images/history/sor_juana_epidemia_1695.jpg',
        locationName: 'Ex Convento de San Jerónimo, Ciudad de México',
        coordinates: { lat: 19.4267, lng: -99.1375 },
        narrativeCaption: 'Mi obra quedó impresa en ambos mundos como testimonio de libertad intelectual.'
      }
    ],
    keyLocations: [
      {
        id: 'sor-loc1',
        name: 'Ex Convento de San Jerónimo',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4267, lng: -99.1375 },
        significance: 'Claustro donde reuní más de cuatro mil volúmenes e instrumentos matemáticos y musicales.',
        imageUrl: '/images/history/sor_juana_primero_sueno.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'sor-vq1',
        question: '¿En qué escrito de 1691 defendí el derecho de las mujeres a la educación y al estudio científico?',
        options: ['Respuesta a Sor Filotea de la Cruz', 'Los Sentimientos de la Nación', 'La Sucesión Presidencial', 'Visión de Anáhuac'],
        correctIndex: 0,
        explanation: 'El 1 de marzo de 1691 firmé la Respuesta a Sor Filotea de la Cruz, documento pionero del pensamiento moderno.'
      }
    ]
  },
  {
    characterName: 'Francisco Villa',
    vaultNodeSlug: 'francisco_villa',
    isGeographicSite: false,
    historicalEra: 'Revolución Mexicana y División del Norte (1910 - 1923)',
    birthDeathDates: '1878 - 1923',
    shortBio: 'Nací en La Coyotada, Durango, con el nombre de Doroteo Arango. Comandé la División del Norte en la Toma de Zacatecas, fundé escuelas en Canutillo y fui emboscado en Parral el 20 de julio de 1923.',
    detailedContext: 'Organizamos trenes hospitales, caballería relámpago con mis Dorados y en la Hacienda de Canutillo levanté la escuela Felipe Ángeles para los hijos de los campesinos.',
    avatarImageUrl: '/images/history/francisco_villa_avatar.png',
    bookSpineStyle: 'cuaderno_cronista',
    isFromVault: true,
    moments: [
      {
        id: 'vil-m1',
        title: 'Toma de Ciudad Juárez',
        yearOrDate: 'Mayo de 1911',
        description: 'Junto a Pascual Orozco y las fuerzas maderistas tomamos Ciudad Juárez, provocando la caída de la dictadura de Porfirio Díaz.',
        imageUrl: '/images/history/villa_toma_juarez_comic_1.png',
        locationName: 'Ciudad Juárez, Chihuahua',
        coordinates: { lat: 31.7386, lng: -106.4850 },
        narrativeCaption: 'En la frontera norte abrimos el triunfo de la Revolución Maderista.'
      },
      {
        id: 'vil-m2',
        title: 'La Toma de Zacatecas',
        yearOrDate: '23 de Junio de 1914',
        description: 'Con la División del Norte y la artillería del general Felipe Ángeles tomamos los cerros de La Bufa y El Grillo, quebrando la espina dorsal del ejército huertista.',
        imageUrl: '/images/history/villa_batalla_zacatecas_comic_2.png',
        locationName: 'Cerro de la Bufa, Zacatecas',
        coordinates: { lat: 22.7783, lng: -102.5675 },
        narrativeCaption: 'En La Bufa sellamos la derrota definitiva de la usurpación.'
      },
      {
        id: 'vil-m3',
        title: 'El Pacto de Xochimilco con Emiliano Zapata',
        yearOrDate: '4 de Diciembre de 1914',
        description: 'Me reuní con mi hermano del sur, el general Emiliano Zapata, en Xochimilco y entramos juntos al Palacio Nacional en nombre de los campesinos de México.',
        imageUrl: '/images/history/villa_pacto_xochimilco_comic_3.png',
        locationName: 'Xochimilco y Palacio Nacional, Ciudad de México',
        coordinates: { lat: 19.2630, lng: -99.1040 },
        narrativeCaption: 'El Norte y el Sur estrecharon sus manos por la justicia agraria y la escuela rural.'
      },
      {
        id: 'vil-m4',
        title: 'Escuela de Canutillo y Emboscada en Parral',
        yearOrDate: '20 de Julio de 1923',
        description: 'Tras fundar la escuela rural de Canutillo, fui asesinado en una cobarde emboscada en Hidalgo del Parral, Chihuahua, mientras conducía mi automóvil Dodge Brothers.',
        imageUrl: '/images/history/hacienda_canutillo_villa.jpg',
        locationName: 'Hidalgo del Parral, Chihuahua',
        coordinates: { lat: 26.9317, lng: -105.6664 },
        narrativeCaption: 'Prefiero ver un maestro con un libro que un soldado con un fusil.'
      }
    ],
    keyLocations: [
      {
        id: 'vil-loc1',
        name: 'Cerro de la Bufa',
        stateOrCountry: 'Zacatecas, México',
        coordinates: { lat: 22.7783, lng: -102.5675 },
        significance: 'Escenario de nuestra máxima victoria estratégica con la División del Norte el 23 de junio de 1914.',
        imageUrl: '/images/history/cerro_bufa_zacatecas.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'vil-vq1',
        question: '¿En qué batalla decisiva del 23 de junio de 1914 derroté junto a Felipe Ángeles al ejército federal huertista?',
        options: ['La Toma de Zacatecas', 'La Batalla de Puebla', 'El Sitio de Cuautla', 'La Toma de la Alhóndiga'],
        correctIndex: 0,
        explanation: 'Con la División del Norte y la artillería de Felipe Ángeles tomamos Zacatecas el 23 de junio de 1914.'
      }
    ]
  },
  {
    characterName: 'Emiliano Zapata',
    vaultNodeSlug: 'emiliano_zapata',
    isGeographicSite: false,
    historicalEra: 'Revolución del Sur y Agrarismo (1911 - 1919)',
    birthDeathDates: '1879 - 1919',
    shortBio: 'Nací en Anenecuilco, Morelos. Encabecé el Ejército Libertador del Sur y proclamé el Plan de Ayala el 28 de noviembre de 1911 para restituir las tierras, montes y aguas a las comunidades campesinas.',
    detailedContext: 'Elegido calpuleque de mi pueblo en 1909 para defender los títulos primordiales de tierra, sostuve la bandera de Reforma, Libertad, Justicia y Ley hasta mi emboscada en Chinameca el 10 de abril de 1919.',
    avatarImageUrl: '/images/history/emiliano_zapata_avatar.png',
    bookSpineStyle: 'cuaderno_cronista',
    isFromVault: true,
    moments: [
      {
        id: 'zap-m1',
        title: 'Elección como Defensor de Anenecuilco',
        yearOrDate: '12 de Septiembre de 1909',
        description: 'El consejo de ancianos de San Miguel Anenecuilco me entregó los documentos coloniales para defender las tierras comunales frente al despojo de las haciendas.',
        imageUrl: '/images/history/zapata_eleccion_anenecuilco.jpg',
        locationName: 'Anenecuilco, Morelos',
        coordinates: { lat: 18.7786, lng: -98.9869 },
        narrativeCaption: 'Recibí el mandato de mi pueblo para jamás traicionar la causa de la tierra.'
      },
      {
        id: 'zap-m2',
        title: 'Proclamación del Plan de Ayala',
        yearOrDate: '28 de Noviembre de 1911',
        description: 'En Ayoxuxtla, Puebla, firmé junto a Otilio Montaño el Plan de Ayala ordenando la restitución inmediata de tierras, montes y aguas a los pueblos.',
        imageUrl: '/images/history/zapata_proclamacion_plan_ayala.jpg',
        locationName: 'Ayoxuxtla, Puebla',
        coordinates: { lat: 18.2931, lng: -98.7653 },
        narrativeCaption: 'La tierra es de quien la trabaja con sus manos.'
      },
      {
        id: 'zap-m3',
        title: 'Alianza en Xochimilco con Francisco Villa',
        yearOrDate: '4 de Diciembre de 1914',
        description: 'Sellé con el general Francisco Villa el Pacto de Xochimilco para que el constitucionalismo incorporara las demandas agrarias del pueblo.',
        imageUrl: '/images/history/zapata_pacto_xochimilco.jpg',
        locationName: 'Xochimilco, Ciudad de México',
        coordinates: { lat: 19.2630, lng: -99.1040 },
        narrativeCaption: 'Unimos los ejércitos campesinos del Sur y del Norte.'
      },
      {
        id: 'zap-m4',
        title: 'Emboscada en la Hacienda de Chinameca',
        yearOrDate: '10 de Abril de 1919',
        description: 'Fui traicionado y emboscado por las tropas de Jesús Guajardo al cruzar el portón de la Hacienda de Chinameca montado en mi caballo El As de Oros.',
        imageUrl: '/images/history/zapata_emboscada_chinameca.jpg',
        locationName: 'Ex Hacienda de Chinameca, Morelos',
        coordinates: { lat: 18.6231, lng: -98.9958 },
        narrativeCaption: 'Cayeron las balas en Chinameca, pero el ideal agrario quedó consagrado en el Artículo 27.'
      }
    ],
    keyLocations: [
      {
        id: 'zap-loc1',
        name: 'Anenecuilco y Chinameca',
        stateOrCountry: 'Morelos, México',
        coordinates: { lat: 18.7786, lng: -98.9869 },
        significance: 'Cuna de la lucha agraria del Ejército Libertador del Sur.',
        imageUrl: '/images/history/zapata_proclamacion_plan_ayala.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'zap-vq1',
        question: '¿Qué documento proclamé el 28 de noviembre de 1911 para restituir las tierras, montes y aguas a los pueblos?',
        options: ['El Plan de Ayala', 'El Plan de Guadalupe', 'El Plan de Agua Prieta', 'El Plan de Tuxtepec'],
        correctIndex: 0,
        explanation: 'Firmé el Plan de Ayala en Ayoxuxtla el 28 de noviembre de 1911 como eje de la revolución agraria.'
      }
    ]
  },
  {
    characterName: 'Cuauhtémoc',
    vaultNodeSlug: 'cuauhtemoc',
    isGeographicSite: false,
    historicalEra: 'Defensa de México-Tenochtitlan (1520 - 1525)',
    birthDeathDates: '1496 - 1525',
    shortBio: 'Fui el último Huey Tlatoani de México-Tenochtitlan y encabecé la heroica defensa de nuestra ciudad lacustre durante 93 días de asedio en 1521.',
    detailedContext: 'Mi nombre en náhuatl significa Águila que desciende. Resistí el sitio y el tormento sin quebrantar la dignidad de mi pueblo.',
    avatarImageUrl: '/images/history/cuauhtemoc_avatar.png',
    bookSpineStyle: 'codice_antiguo',
    isFromVault: true,
    moments: [
      {
        id: 'cua-m1',
        title: 'Defensa Heroica de México-Tenochtitlan',
        yearOrDate: 'Mayo - Agosto de 1521',
        description: 'Durante 93 días defendimos cada calzada, canal y templo de México-Tenochtitlan y Tlatelolco.',
        imageUrl: '/images/history/cuauhtemoc_defensa_asedio.jpg',
        locationName: 'Tlatelolco, México-Tenochtitlan',
        coordinates: { lat: 19.4511, lng: -99.1372 },
        narrativeCaption: 'Nuestro sol se ocultó en Tlatelolco, pero nuestra raíz permanece viva.'
      },
      {
        id: 'cua-m2',
        title: 'El Encuentro con Hernán Cortés tras la Caída',
        yearOrDate: '13 de Agosto de 1521',
        description: 'Al ser capturada nuestra canoa en Tlatelolco, encaré con dignidad a Hernán Cortés exigiendo la muerte honrosa de un gobernante vencido.',
        imageUrl: '/images/history/cuauhtemoc_captura_cortes.jpg',
        locationName: 'Plaza de las Tres Culturas, Tlatelolco',
        coordinates: { lat: 19.4510, lng: -99.1372 },
        narrativeCaption: 'He cumplido con mi pueblo y con mi deber.'
      }
    ],
    keyLocations: [
      {
        id: 'cua-loc1',
        name: 'Zona Arqueológica de Tlatelolco',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4511, lng: -99.1372 },
        significance: 'Último bastión de la resistencia mexica el 13 de agosto de 1521.',
        imageUrl: '/images/history/cuauhtemoc_defensa_asedio.jpg'
      },
      {
        id: 'cua-loc2',
        name: 'Templo Mayor de México-Tenochtitlan',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4351, lng: -99.1312 },
        significance: 'Corazón sagrado de nuestro imperio donde juré defender nuestra soberanía.',
        imageUrl: '/images/history/cuauhtemoc_noche_triste.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'cua-vq1',
        question: '¿Qué significa mi nombre Cuauhtémoc en lengua náhuatl?',
        options: ['Águila que desciende', 'Serpiente emplumada', 'Estrella de la mañana', 'Escudo de jade'],
        correctIndex: 0,
        explanation: 'Cuauhtémoc proviene de cuauhtli (águila) y temoc (que desciende para atacar).'
      },
      {
        id: 'cua-vq2',
        question: '¿Qué actitud mantuve frente al tormento en Coyoacán para proteger los bienes de mi pueblo?',
        options: ['Resistencia serena y silencio inquebrantable', 'Alianza con la Corona española', 'Abandono de la tropa', 'Entrega inmediata de los templos'],
        correctIndex: 0,
        explanation: 'Soporté el fuego con entereza inquebrantable sin traicionar jamás a mi pueblo.'
      }
    ]
  },
  {
    characterName: 'Lázaro Cárdenas del Río',
    vaultNodeSlug: 'lazaro_cardenas_del_rio',
    isGeographicSite: false,
    historicalEra: 'México Contemporáneo y Soberanía Energética (1934 - 1940)',
    birthDeathDates: '1895 - 1970',
    shortBio: 'Fui Presidente de la República y decreté la Expropiación Petrolera el 18 de marzo de 1938, fundé el Instituto Politécnico Nacional (IPN) y otorgué asilo diplomático al exilio republicano.',
    detailedContext: 'Nací en Jiquilpan, Michoacán. Impulsé el reparto agrario en La Laguna y Yucatán y creé el Museo Nacional de Historia en el Castillo de Chapultepec.',
    avatarImageUrl: '/images/history/lazaro_cardenas_avatar.png',
    bookSpineStyle: 'diario_republicano',
    isFromVault: true,
    moments: [
      {
        id: 'car-m1',
        title: 'Decreto de la Expropiación Petrolera',
        yearOrDate: '18 de Marzo de 1938',
        description: 'A las diez de la noche dirigí mi mensaje por radio a toda la nación anunciando la expropiación de la industria petrolera en defensa de la soberanía y la ley mexicana.',
        imageUrl: '/images/history/cardenas_expropiacion_petrolera.jpg',
        locationName: 'Palacio Nacional, Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        narrativeCaption: 'El subsuelo y la riqueza energética pertenecen a la nación mexicana.'
      },
      {
        id: 'car-m2',
        title: 'Reparto Agrario en la Comarca Lagunera',
        yearOrDate: 'Octubre de 1936',
        description: 'Encabecé el reparto directo de tierras fértiles de la Comarca Lagunera y de más de 18 millones de hectáreas en todo el país.',
        imageUrl: '/images/history/cardenas_reparto_laguna.jpg',
        locationName: 'Torreón, Coahuila y Durango',
        coordinates: { lat: 25.5428, lng: -103.4068 },
        narrativeCaption: 'La tierra es fuente de dignidad y justicia social para quienes la trabajan.'
      }
    ],
    keyLocations: [
      {
        id: 'car-loc1',
        name: 'Palacio de Bellas Artes (Colecta Nacional)',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4352, lng: -99.1412 },
        significance: 'Recinto donde el pueblo entero acudió en 1938 a solidarizarse para cubrir la indemnización petrolera.',
        imageUrl: '/images/history/cardenas_colecta_bellas_artes.jpg'
      },
      {
        id: 'car-loc2',
        name: 'Jiquilpan de Juárez',
        stateOrCountry: 'Michoacán, México',
        coordinates: { lat: 19.9922, lng: -102.7192 },
        significance: 'Tierra natal donde forjé mis convicciones sociales y republicanas.',
        imageUrl: '/images/history/cardenas_asilo_espanoles.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'car-vq1',
        question: '¿En qué fecha histórica decreté por radio la Expropiación Petrolera?',
        options: ['18 de marzo de 1938', '5 de febrero de 1917', '20 de noviembre de 1910', '16 de septiembre de 1810'],
        correctIndex: 0,
        explanation: 'El 18 de marzo de 1938 expedí el decreto expropiatorio con apego al Artículo 27 Constitucional.'
      },
      {
        id: 'car-vq2',
        question: '¿Qué casa de estudios técnicos superiores fundé en 1936 para formar a los hijos de obreros y campesinos?',
        options: ['Instituto Politécnico Nacional (IPN)', 'Real y Pontificia Universidad', 'Colegio de las Vizcaínas', 'Academia de San Carlos'],
        correctIndex: 0,
        explanation: 'Fundé el Instituto Politécnico Nacional para poner la técnica al servicio de la patria.'
      }
    ]
  },
  {
    characterName: 'Santiago de Querétaro (Zona de Monumentos)',
    vaultNodeSlug: 'santiago_de_queretaro',
    isGeographicSite: true,
    historicalEra: 'Cuna de la Independencia (1810), Triunfo de la República (1867) y Constitución (1917)',
    birthDeathDates: '1531 - Presente',
    shortBio: 'Soy la histórica ciudad de Santiago de Querétaro. En mis casonas de cantera rosa se gestó la Conspiración de 1810, en mi Cerro de las Campanas triunfó la República en 1867 y en mi Teatro de la República se promulgó la Constitución de 1917.',
    detailedContext: 'Patrimonio Cultural de la Humanidad con mi monumental Acueducto de 74 arcos, la Casa de la Corregidora y el Teatro de la República.',
    avatarImageUrl: '/images/history/santiago_de_queretaro_avatar.jpg',
    bookSpineStyle: 'tomo_imperial',
    isFromVault: true,
    moments: [
      {
        id: 'qro-m1',
        title: 'Conspiración de Querétaro de 1810',
        yearOrDate: 'Septiembre de 1810',
        description: 'En mi Casa del Corregimiento se reunieron Doña Josefa Ortiz, Ignacio Allende y Miguel Hidalgo para trazar la emancipación de México.',
        imageUrl: '/images/history/casa_corregidora_queretaro.jpg',
        locationName: 'Casa de la Corregidora, Centro Histórico de Querétaro',
        coordinates: { lat: 20.5931, lng: -100.3928 },
        narrativeCaption: 'De mis calles coloniales partió el galope nocturno hacia Dolores.'
      },
      {
        id: 'qro-m2',
        title: 'Promulgación de la Constitución de 1917',
        yearOrDate: '5 de Febrero de 1917',
        description: 'En mi Teatro de la República el Congreso Constituyente promulgó la primera Constitución social del siglo XX con los artículos 3°, 27 y 123.',
        imageUrl: '/images/history/teatro_republica_1917.jpg',
        locationName: 'Teatro de la República, Querétaro',
        coordinates: { lat: 20.5944, lng: -100.3925 },
        narrativeCaption: 'En mi escenario nació el pacto constitucional que rige a México.'
      }
    ],
    keyLocations: [
      {
        id: 'qro-loc1',
        name: 'Acueducto y Teatro de la República',
        stateOrCountry: 'Querétaro, México',
        coordinates: { lat: 20.5944, lng: -100.3925 },
        significance: 'Enclave de las tres grandes transformaciones históricas de México.',
        imageUrl: '/images/history/acueducto_queretaro.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'qro-vq1',
        question: '¿Qué tres acontecimientos fundamentales de la historia nacional ocurrieron en mi suelo queretano?',
        options: [
          'La Conspiración de 1810, el Sitio y Triunfo de la República en 1867 y la Constitución de 1917',
          'Únicamente la fundación de Veracruz',
          'El Tratado de Guadalupe Hidalgo de 1848',
          'La Batalla del 5 de Mayo de 1862'
        ],
        correctIndex: 0,
        explanation: 'En mi suelo tuvieron lugar la Conspiración de 1810, el fin del Segundo Imperio en 1867 y el Congreso Constituyente de 1916-1917.'
      }
    ]
  }
];

const VAULT_22_QUICK_LOOKUP: Array<{
  match: RegExp;
  characterName: string;
  avatarImageUrl: string;
  birthDeathDates: string;
  historicalEra: string;
  shortBio: string;
  isGeographicSite?: boolean;
  moments: HistoricalFigureMoment[];
  keyLocations: HistoricalKeyLocation[];
  verificationQuestions: HistoricalVerificationQuestion[];
}> = [
  {
    match: /cuauht[eé]moc/i,
    characterName: 'Cuauhtémoc',
    avatarImageUrl: '/images/history/cuauhtemoc_avatar.png',
    birthDeathDates: '1496 - 1525',
    historicalEra: 'Resistencia Mexica y Defensa de Tenochtitlan',
    shortBio: 'Fui el último huey tlatoani de México-Tenochtitlan; defendí con honor inquebrantable la soberanía del Anáhuac durante setenta y cinco días de sitio.',
    moments: [
      {
        id: 'cuau-m1',
        title: 'Defensa del Sitio de México-Tenochtitlan',
        yearOrDate: 'Mayo - Agosto de 1521',
        description: 'Asumí el mando supremo de nuestros guerreros mexicas y tlatelolcas para defender calzada por calzada la gran capital del Anáhuac durante setenta y cinco días continuos de asedio.',
        imageUrl: '/images/history/cuauhtemoc_defensa_asedio.jpg',
        locationName: 'México-Tenochtitlan y Tlatelolco',
        coordinates: { lat: 19.4508, lng: -99.1375 },
        narrativeCaption: 'Mientras quede un aliento en nuestro pecho, México-Tenochtitlan no se rendirá al invasor.'
      },
      {
        id: 'cuau-m2',
        title: 'El Encuentro con Hernán Cortés tras la Caída',
        yearOrDate: '13 de Agosto de 1521',
        description: 'Al ser capturada nuestra canoa en Tlatelolco, encaré con dignidad a Hernán Cortés señalando el puñal en su cinto y exigiéndole la muerte honrosa de un gobernante vencido.',
        imageUrl: '/images/history/cuauhtemoc_captura_cortes.jpg',
        locationName: 'Plaza de las Tres Culturas, Tlatelolco',
        coordinates: { lat: 19.4510, lng: -99.1372 },
        narrativeCaption: 'He cumplido con mi pueblo y con mi deber; haz de mi vida lo que tu justicia dicte.'
      }
    ],
    keyLocations: [
      {
        id: 'cuau-loc1',
        name: 'Tlatelolco (Último Bastión Mexica)',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4510, lng: -99.1372 },
        significance: 'Baluarte final donde sostuve la resistencia hasta el 13 de agosto de 1521.',
        imageUrl: '/images/history/cuauhtemoc_tormento_pies.jpg'
      },
      {
        id: 'cuau-loc2',
        name: 'Templo Mayor de México-Tenochtitlan',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4351, lng: -99.1312 },
        significance: 'Corazón sagrado de nuestro imperio donde juré defender nuestra soberanía.',
        imageUrl: '/images/history/cuauhtemoc_noche_triste.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'cuau-vq1',
        question: '¿Qué ciudad capitaneé durante el heroico asedio de 75 días en 1521?',
        options: ['México-Tenochtitlan', 'Texcoco', 'Cholula', 'Tlaxcala'],
        correctIndex: 0,
        explanation: 'Asumí el título de huey tlatoani para encabezar la defensa final de México-Tenochtitlan.'
      },
      {
        id: 'cuau-vq2',
        question: '¿Qué actitud mantuve frente al tormento en Coyoacán para proteger los bienes de mi pueblo?',
        options: ['Resistencia serena y silencio inquebrantable', 'Alianza con la Corona española', 'Abandono de la tropa', 'Entrega inmediata de los templos'],
        correctIndex: 0,
        explanation: 'Soporté el fuego en mis pies con entereza, recordando que tampoco el lecho de dolor era un lecho de rosas.'
      }
    ]
  },
  {
    match: /c[aá]rdenas/i,
    characterName: 'Lázaro Cárdenas del Río',
    avatarImageUrl: '/images/history/lazaro_cardenas_avatar.png',
    birthDeathDates: '1895 - 1970',
    historicalEra: 'Cardenismo y Expropiación Petrolera (1934 - 1940)',
    shortBio: 'Promulgué la Expropiación Petrolera el 18 de marzo de 1938, fundé el Instituto Politécnico Nacional y repartí 18 millones de hectáreas al campesinado.',
    moments: [
      {
        id: 'car-m1',
        title: 'Decreto de Expropiación Petrolera',
        yearOrDate: '18 de Marzo de 1938',
        description: 'Ante la rebeldía de las compañías petroleras extranjeras contra los fallos de nuestra Suprema Corte, emití por cadena nacional el decreto que devolvió el subsuelo y la industria del petróleo al patrimonio de México.',
        imageUrl: '/images/history/cardenas_expropiacion_petrolera.jpg',
        locationName: 'Palacio Nacional, Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1313 },
        narrativeCaption: 'Nuestro subsuelo pertenece por mandato constitucional e histórico a la nación mexicana.'
      },
      {
        id: 'car-m2',
        title: 'Reparto Agrario en la Comarca Lagunera',
        yearOrDate: 'Octubre de 1936',
        description: 'Encabecé el reparto directo de tierras fértiles de la Comarca Lagunera y de más de 18 millones de hectáreas en todo el país, entregando ejidos y crédito agrícola a los campesinos.',
        imageUrl: '/images/history/cardenas_reparto_laguna.jpg',
        locationName: 'Torreón, Coahuila y Durango',
        coordinates: { lat: 25.5428, lng: -103.4068 },
        narrativeCaption: 'La tierra es fuente de dignidad y justicia social para quienes la trabajan con sus manos.'
      }
    ],
    keyLocations: [
      {
        id: 'car-loc1',
        name: 'Palacio Nacional y Palacio de Bellas Artes',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4352, lng: -99.1412 },
        significance: 'Escenario donde miles de familias mexicanas aportaron con patriotismo para respaldar la indemnización petrolera.',
        imageUrl: '/images/history/cardenas_colecta_bellas_artes.jpg'
      },
      {
        id: 'car-loc2',
        name: 'Jiquilpan de Juárez',
        stateOrCountry: 'Michoacán, México',
        coordinates: { lat: 19.9922, lng: -102.7192 },
        significance: 'Tierra natal donde forjé mis convicciones sociales y republicanas.',
        imageUrl: '/images/history/cardenas_asilo_espanoles.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'car-vq1',
        question: '¿En qué fecha histórica promulgué el decreto de la Expropiación Petrolera?',
        options: ['18 de marzo de 1938', '5 de febrero de 1917', '16 de septiembre de 1810', '20 de noviembre de 1910'],
        correctIndex: 0,
        explanation: 'El 18 de marzo de 1938 decreté la nacionalización de la industria petrolera para salvaguardar nuestra soberanía.'
      },
      {
        id: 'car-vq2',
        question: '¿Qué casa de estudios técnicos superiores fundé en 1936 para formar a los hijos de obreros y campesinos?',
        options: ['Instituto Politécnico Nacional (IPN)', 'Real y Pontificia Universidad', 'Colegio de las Vizcaínas', 'Academia de San Carlos'],
        correctIndex: 0,
        explanation: 'Fundé el Instituto Politécnico Nacional para poner la técnica al servicio de la patria.'
      }
    ]
  },
  {
    match: /allende/i,
    characterName: 'Ignacio Allende',
    avatarImageUrl: '/images/history/ignacio_allende_avatar.png',
    birthDeathDates: '1769 - 1811',
    historicalEra: 'Guerra de Independencia - Estrategia Militar',
    shortBio: 'Fui capitán del Regimiento de Dragones de la Reina y teniente general insurgente; tracé la estrategia militar victoriosa en el Monte de las Cruces.',
    moments: [
      {
        id: 'all-m1',
        title: 'Conspiración de los Dragones de la Reina',
        yearOrDate: '1809 - Septiembre de 1810',
        description: 'Coordiné en San Miguel el Grande y Santiago de Querétaro a oficiales criollos comprometidos con la emancipación patria.',
        imageUrl: '/images/history/allende_conspiracion_dragones.jpg',
        locationName: 'San Miguel el Grande, Guanajuato',
        coordinates: { lat: 20.9144, lng: -100.7453 },
        narrativeCaption: 'Un ejército disciplinado y leal a la libertad es indispensable para vencer al virreinato.'
      },
      {
        id: 'all-m2',
        title: 'Maniobra Táctica en el Monte de las Cruces',
        yearOrDate: '30 de Octubre de 1810',
        description: 'Desplegué nuestra artillería y caballería en envolvente sobre las filas realistas, abriendo el camino hacia el Valle de México.',
        imageUrl: '/images/history/allende_monte_cruces.jpg',
        locationName: 'Monte de las Cruces, Ocoyoacac',
        coordinates: { lat: 19.3167, lng: -99.3667 },
        narrativeCaption: 'La táctica militar y el empuje popular derrotaron al ejército virreinal.'
      }
    ],
    keyLocations: [
      {
        id: 'all-loc1',
        name: 'San Miguel de Allende (antes San Miguel el Grande)',
        stateOrCountry: 'Guanajuato, México',
        coordinates: { lat: 20.9144, lng: -100.7453 },
        significance: 'Mi ciudad natal y centro de organización de los cuadros militares insurgentes.',
        imageUrl: '/images/history/san_miguel_allende.jpg'
      },
      {
        id: 'all-loc2',
        name: 'Puente de Calderón y Chihuahua',
        stateOrCountry: 'Jalisco y Chihuahua, México',
        coordinates: { lat: 28.6353, lng: -106.0745 },
        significance: 'Escenarios donde combatí hasta el sacrificio final el 26 de junio de 1811.',
        imageUrl: '/images/history/allende_fusilamiento.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'all-vq1',
        question: '¿En qué regimiento provincial serví antes de encabezar el ejército insurgente?',
        options: ['Regimiento de Dragones de la Reina', 'Ejército Trigarante', 'División del Norte', 'Batteón de San Patricio'],
        correctIndex: 0,
        explanation: 'Fui capitán del Regimiento de Dragones de la Reina en San Miguel el Grande.'
      },
      {
        id: 'all-vq2',
        question: '¿Cuál fue mi recomendación estratégica tras nuestra victoria en el Monte de las Cruces?',
        options: ['Avanzar de inmediato sobre la Ciudad de México y organizar regimientos regulares', 'Firmar el indulto virreinal', 'Disolver el ejército', 'Retirarse a Yucatán'],
        correctIndex: 0,
        explanation: 'Sostuve que debíamos aprovechar la ventaja militar para tomar la capital y profesionalizar la tropa.'
      }
    ]
  },
  {
    match: /madero/i,
    characterName: 'Francisco I. Madero',
    avatarImageUrl: '/images/history/madero_avatar.png',
    birthDeathDates: '1873 - 1913',
    historicalEra: 'Revolución Maderista y Democracia',
    shortBio: 'Proclamé el Plan de San Luis bajo el lema "Sufragio Efectivo, No Reelección" y convoqué al pueblo mexicano a conquistar la democracia el 20 de noviembre de 1910.',
    moments: [
      {
        id: 'mad-m1',
        title: 'Publicación de "La Sucesión Presidencial en 1910" y Plan de San Luis',
        yearOrDate: '1908 - Octubre de 1910',
        description: 'Redacté la obra que despertó la conciencia democrática del país y convoqué al alzamiento nacional para el 20 de noviembre de 1910 bajo el principio de Sufragio Efectivo, No Reelección.',
        imageUrl: '/images/history/madero_plan_san_luis.jpg',
        locationName: 'San Luis Potosí y Coahuila',
        coordinates: { lat: 22.1565, lng: -100.9855 },
        narrativeCaption: 'El pueblo tiene derecho a elegir libremente a sus gobernantes sin dictaduras eternas.'
      },
      {
        id: 'mad-m2',
        title: 'Entrada Triunfal a la Ciudad de México',
        yearOrDate: '7 de Junio de 1911',
        description: 'Tras los Tratados de Ciudad Juárez y la caída de la dictadura, ingresé a la capital entre multitudes que celebraban la apertura democrática.',
        imageUrl: '/images/history/madero_entrada_triunfal_1911.jpg',
        locationName: 'Paseo de la Reforma y Zócalo, Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        narrativeCaption: 'La libertad conquistada se sostiene con legalidad, prensa libre y voto limpio.'
      }
    ],
    keyLocations: [
      {
        id: 'mad-loc1',
        name: 'Parras de la Fuente',
        stateOrCountry: 'Coahuila, México',
        coordinates: { lat: 25.4414, lng: -102.1786 },
        significance: 'Hacienda del Rosario donde nací y experimenté técnicas agrícolas y apoyo educativo comunitario.',
        imageUrl: '/images/history/madero_libro_sucesion.jpg'
      },
      {
        id: 'mad-loc2',
        name: 'Palacio Nacional y Lecumberri',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1313 },
        significance: 'Sede de mi gobierno constitucional hasta la traición de la Decena Trágica en febrero de 1913.',
        imageUrl: '/images/history/madero_martirio_lecumberri.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'mad-vq1',
        question: '¿Cuál fue el lema político fundamental que proclamé contra la dictadura porfirista?',
        options: ['Sufragio Efectivo, No Reelección', 'Poca política y mucha administración', 'Orden y Progreso', 'Tierra y Libertad'],
        correctIndex: 0,
        explanation: 'Convoqué a la nación a restaurar el voto libre bajo el lema "Sufragio Efectivo, No Reelección".'
      },
      {
        id: 'mad-vq2',
        question: '¿Para qué fecha llamé al levantamiento armado mediante el Plan de San Luis?',
        options: ['20 de noviembre de 1910 a las 6 de la tarde', '16 de septiembre de 1810', '5 de mayo de 1862', '18 de marzo de 1938'],
        correctIndex: 0,
        explanation: 'El Plan de San Luis señaló el domingo 20 de noviembre de 1910 como inicio de la Revolución Mexicana.'
      }
    ]
  },
  {
    match: /felipe\s+[aá]ngeles/i,
    characterName: 'Felipe Ángeles',
    avatarImageUrl: '/images/history/felipe_angeles_avatar.png',
    birthDeathDates: '1868 - 1919',
    historicalEra: 'Revolución Mexicana y Artillería Científica',
    shortBio: 'Fui director del Heroico Colegio Militar y estratega artillero de la División del Norte en la Toma de Zacatecas, guiado siempre por el honor y el humanismo.',
    moments: [
      {
        id: 'ang-m1',
        title: 'Dirección Humanista del Heroico Colegio Militar',
        yearOrDate: '1912 - 1913',
        description: 'Nombrado por el presidente Madero, erradiqué los castigos corporales y formé jóvenes oficiales demócratas y respetuosos del orden civil.',
        imageUrl: '/images/history/angeles_colegio_militar.jpg',
        locationName: 'Castillo de Chapultepec, Ciudad de México',
        coordinates: { lat: 19.4204, lng: -99.1819 },
        narrativeCaption: 'Un soldado republicano debe proteger al ciudadano, nunca oprimirlo.'
      },
      {
        id: 'ang-m2',
        title: 'Planificación Balística en la Toma de Zacatecas',
        yearOrDate: '23 de Junio de 1914',
        description: 'Calculé con rigor científico la posición de nuestra artillería para batir los cerros de La Bufa y El Grillo, asegurando la victoria decisiva de la División del Norte.',
        imageUrl: '/images/history/angeles_batalla_zacatecas.jpg',
        locationName: 'Cerro de la Bufa, Zacatecas',
        coordinates: { lat: 22.7758, lng: -102.5694 },
        narrativeCaption: 'La ciencia matemática y el valor conjunto quebraron la usurpación militar.'
      }
    ],
    keyLocations: [
      {
        id: 'ang-loc1',
        name: 'Zacualtipán y Chapultepec',
        stateOrCountry: 'Hidalgo y Ciudad de México',
        coordinates: { lat: 20.6508, lng: -98.6528 },
        significance: 'Mi tierra natal serrana y la escuela militar donde forjé la vocación de servicio.',
        imageUrl: '/images/history/angeles_pacificacion_morelos.jpg'
      },
      {
        id: 'ang-loc2',
        name: 'Teatro de los Héroes, Chihuahua',
        stateOrCountry: 'Chihuahua, México',
        coordinates: { lat: 28.6353, lng: -106.0744 },
        significance: 'Recinto donde defendí la concordia nacional ante mi consejo de guerra en noviembre de 1919.',
        imageUrl: '/images/history/angeles_fusilamiento_chihuahua.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'ang-vq1',
        question: '¿Qué reforma humanista implanté como director del Heroico Colegio Militar en 1912?',
        options: ['Suprimir los castigos corporales y fomentar la ética civil', 'Duplicar las multas a civiles', 'Cerrar las cátedras de matemáticas', 'Prohibir la artillería'],
        correctIndex: 0,
        explanation: 'Prohibí todo maltrato físico a los cadetes y promoví una disciplina basada en el honor cívico.'
      },
      {
        id: 'ang-vq2',
        question: '¿Qué cuerpo militar comandado por Pancho Villa contó con mi estrategia de artillería en Zacatecas?',
        options: ['La División del Norte', 'La Legión Extranjera', 'El Regimiento de Acapulco', 'Los Supremos Poderes'],
        correctIndex: 0,
        explanation: 'Dirigí el fuego de artillería de la División del Norte en Torreón y en la decisiva Batalla de Zacatecas.'
      }
    ]
  },
  {
    match: /carmen\s+serd[aá]n/i,
    characterName: 'Carmen Serdán Alatriste',
    avatarImageUrl: '/images/history/carmen_serdan_avatar.png',
    birthDeathDates: '1873 - 1948',
    historicalEra: 'Heroínas Fundacionales de la Revolución Mexicana',
    shortBio: 'El 18 de noviembre de 1910 en Puebla empuñé las armas desde el balcón de nuestra casa en Santa Clara convocando al pueblo a defender la libertad.',
    moments: [
      {
        id: 'cser-m1',
        title: 'Traslado Clandestino de Parque y Propaganda',
        yearOrDate: 'Septiembre - Noviembre de 1910',
        description: 'Organicé redes discretas bajo el seudónimo de "Marcos Serratos", transportando armas y proclamas antirreeleccionistas para la insurrección en Puebla.',
        imageUrl: '/images/history/carmen_trafico_armas.jpg',
        locationName: 'Puebla y Tlaxcala',
        coordinates: { lat: 19.0414, lng: -98.2063 },
        narrativeCaption: 'La libertad exige convicción, sigilo y entrega absoluta antes del alba revolucionaria.'
      },
      {
        id: 'cser-m2',
        title: 'La Arenga Armada en el Balcón de Santa Clara',
        yearOrDate: '18 de Noviembre de 1910',
        description: 'Durante el asedio policial en nuestra casa de Santa Clara, salí al balcón con carabina en mano convocando a los poblanos a levantarse por la libertad.',
        imageUrl: '/images/history/carmen_balcon_arenga.jpg',
        locationName: 'Casa de los Hermanos Serdán, Puebla',
        coordinates: { lat: 19.0446, lng: -98.1955 },
        narrativeCaption: '¡Poblanos, ha llegado el momento de conquistar el voto y la libertad con valor!'
      }
    ],
    keyLocations: [
      {
        id: 'cser-loc1',
        name: 'Casa de Santa Clara (Museo Regional de la Revolución)',
        stateOrCountry: 'Puebla, México',
        coordinates: { lat: 19.0446, lng: -98.1955 },
        significance: 'Hogar familiar donde resistimos el primer combate de la Revolución Mexicana el 18 de noviembre de 1910.',
        imageUrl: '/images/history/carmen_enfermera_revolucion.jpg'
      },
      {
        id: 'cser-loc2',
        name: 'Cárcel de la Merced',
        stateOrCountry: 'Puebla, México',
        coordinates: { lat: 19.0462, lng: -98.1941 },
        significance: 'Prisión donde permanecí herida y recluida tras el combate de Santa Clara.',
        imageUrl: '/images/history/carmen_prision_merced.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'cser-vq1',
        question: '¿Qué seudónimo revolucionario utilicé para despachar correspondencia y armas antes del 18 de noviembre de 1910?',
        options: ['Marcos Serratos', 'El Centauro del Norte', 'Siervo de la Nación', 'El Nigromante'],
        correctIndex: 0,
        explanation: 'Firmaba mis mensajes clandestinos como "Marcos Serratos" para coordinar la red antirreeleccionista.'
      },
      {
        id: 'cser-vq2',
        question: '¿En qué calle de Puebla defendí nuestra casa desde el balcón el 18 de noviembre de 1910?',
        options: ['Calle de Santa Clara (hoy 6 Oriente)', 'Paseo Montejo', 'Avenida Madero en CDMX', 'Calzada de los Héroes en León'],
        correctIndex: 0,
        explanation: 'Desde el balcón de nuestra casa en Santa Clara exhorté al pueblo poblano mientras resistíamos el asalto.'
      }
    ]
  },
  {
    match: /aquiles\s+serd[aá]n/i,
    characterName: 'Aquiles Serdán',
    avatarImageUrl: '/images/history/aquiles_serdan_avatar.png',
    birthDeathDates: '1876 - 1910',
    historicalEra: 'Precursores y Mártires de la Revolución',
    shortBio: 'Encabecé el levantamiento antirreeleccionista en Puebla el 18 de noviembre de 1910, convirtiendo nuestro hogar en la chispa moral de la Revolución Mexicana.',
    moments: [
      {
        id: 'aser-m1',
        title: 'Fundación del Club Político "Luz y Progreso"',
        yearOrDate: '1909',
        description: 'Congregué a obreros textiles y ciudadanos de Puebla en el club Luz y Progreso para organizar comités democráticos y adquirir armamento para defender la legalidad.',
        imageUrl: '/images/history/serdan_club_luz_progreso.jpg',
        locationName: 'Ciudad de Puebla, Puebla',
        coordinates: { lat: 19.0414, lng: -98.2063 },
        narrativeCaption: 'Unidos en la organización obrera y cívica preparamos la caída de la tiranía.'
      },
      {
        id: 'aser-m2',
        title: 'El Primer Combate de la Revolución en Santa Clara',
        yearOrDate: '18 de Noviembre de 1910',
        description: 'Anticipándose el cateo policial dos días antes de la fecha fijada, resistimos durante horas frente a cientos de soldados en defensa del ideario maderista.',
        imageUrl: '/images/history/serdan_combate_santa_clara.jpg',
        locationName: 'Santa Clara, Puebla',
        coordinates: { lat: 19.0446, lng: -98.1955 },
        narrativeCaption: 'Nuestra resistencia en Puebla encendió la conciencia de toda la República.'
      }
    ],
    keyLocations: [
      {
        id: 'aser-loc1',
        name: 'Casa de la Familia Serdán en Santa Clara',
        stateOrCountry: 'Puebla, México',
        coordinates: { lat: 19.0446, lng: -98.1955 },
        significance: 'Escondite de madera bajo la duela donde permanecí oculto tras agotarse el parque.',
        imageUrl: '/images/history/serdan_escondite_duela.jpg'
      },
      {
        id: 'aser-loc2',
        name: 'Plaza Principal de Puebla',
        stateOrCountry: 'Puebla, México',
        coordinates: { lat: 19.0436, lng: -98.1981 },
        significance: 'Memorial cívico donde nuestra entrega inspiró al alzamiento de 1910.',
        imageUrl: '/images/history/serdan_martirio_puebla.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'aser-vq1',
        question: '¿Por qué la familia Serdán entabló combate el 18 de noviembre de 1910, dos días antes de lo previsto?',
        options: ['Porque la policía porfirista cateó la casa al descubrir las armas ocultas', 'Porque se adelantó la feria regional', 'Por una confusión telegráfica con Yucatán', 'Porque Madero renunció'],
        correctIndex: 0,
        explanation: 'Al ser delatados, decidimos defender nuestra dignidad y el levantamiento frente a las fuerzas de Cabrera.'
      },
      {
        id: 'aser-vq2',
        question: '¿Cómo se llamaba el club político que organicé en Puebla en apoyo a la democracia?',
        options: ['Luz y Progreso', 'Circo de los Tres Poderes', 'Bando de Guadalajara', 'Sociedad de Mineros'],
        correctIndex: 0,
        explanation: 'El club Luz y Progreso aglutinó a artesanos y obreros poblanos comprometidos con el sufragio efectivo.'
      }
    ]
  },
  {
    match: /belisario\s+dom[ií]nguez/i,
    characterName: 'Belisario Domínguez',
    avatarImageUrl: '/images/history/belisario_dominguez_avatar.png',
    birthDeathDates: '1863 - 1913',
    historicalEra: 'Dignidad Republicana frente a la Dictadura',
    shortBio: 'Ejercí la medicina al servicio de los más humildes y, como senador por Chiapas en 1913, alcé la voz en el Congreso contra la usurpación de Victoriano Huerta.',
    moments: [
      {
        id: 'bdo-m1',
        title: 'Servicio Médico Solidario en Comitán',
        yearOrDate: '1890 - 1912',
        description: 'Formado en París como médico cirujano, atendí sin cobrar honorarios a los enfermos humildes de Comitán y fundé el periódico El Vate para defender la ética pública.',
        imageUrl: '/images/history/belisario_medico_pobres.jpg',
        locationName: 'Comitán de Domínguez, Chiapas',
        coordinates: { lat: 16.2519, lng: -92.1342 },
        narrativeCaption: 'Curar al pueblo y hablar con la verdad son deberes inseparables de conciencia.'
      },
      {
        id: 'bdo-m2',
        title: 'Los Discursos Históricos contra la Usurpación',
        yearOrDate: '23 y 29 de Septiembre de 1913',
        description: 'Redacte e imprimí personalmente mis discursos denunciando los crímenes del dictador Victoriano Huerta y exigiendo al Senado exigir su renuncia.',
        imageUrl: '/images/history/belisario_impresion_clandestina.jpg',
        locationName: 'Cámara de Senadores, Ciudad de México',
        coordinates: { lat: 19.4357, lng: -99.1397 },
        narrativeCaption: 'Si cada senador cumple con su deber, la patria salvará su dignidad constitucional.'
      }
    ],
    keyLocations: [
      {
        id: 'bdo-loc1',
        name: 'Comitán de Domínguez',
        stateOrCountry: 'Chiapas, México',
        coordinates: { lat: 16.2519, lng: -92.1342 },
        significance: 'Mi ciudad natal donde ejercí la medicina solidaria y presidí el ayuntamiento.',
        imageUrl: '/images/history/belisario_redaccion_discurso.jpg'
      },
      {
        id: 'bdo-loc2',
        name: 'Panteón Civil de Xoco (Coyoacán)',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.3621, lng: -99.1674 },
        significance: 'Sitio de mi sacrificio el 7 de octubre de 1913 tras negarme a callar la verdad.',
        imageUrl: '/images/history/belisario_martirio_xoco.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'bdo-vq1',
        question: '¿Qué exigí valientemente desde la tribuna senatorial en septiembre de 1913?',
        options: ['La renuncia inmediata de Victoriano Huerta ante sus crímenes contra la democracia', 'La reelección indefinida del Senado', 'La disolución del Congreso', 'Un empréstito militar'],
        correctIndex: 0,
        explanation: 'Denuncié abiertamente la usurpación de Huerta y llamé al Senado a recuperar el honor de la República.'
      },
      {
        id: 'bdo-vq2',
        question: '¿Por qué tuve que mandar imprimir mis discursos de septiembre de 1913 en un pequeño taller?',
        options: ['Porque el presidente del Senado se negó a leerlos por temor a represalias', 'Porque no había papel en París', 'Para venderlos como novela', 'Por mandato de un congresista extranjero'],
        correctIndex: 0,
        explanation: 'Imprimí personalmente las hojas volantes con el apoyo de una joven impresora patriota para repartirlas en la capital.'
      }
    ]
  },
  {
    match: /flores\s+mag[oó]n/i,
    characterName: 'Ricardo Flores Magón',
    avatarImageUrl: '/images/history/ricardo_flores_magon_avatar.png',
    birthDeathDates: '1873 - 1922',
    historicalEra: 'Precursor Intelectual de la Revolución Mexicana',
    shortBio: 'Desde las páginas del periódico Regeneración y el Partido Liberal Mexicano sembré los derechos obreros de jornada de 8 horas, salario digno y educación laica.',
    moments: [
      {
        id: 'rfm-m1',
        title: 'El Periódico Regeneración y "La Constitución ha Muerto"',
        yearOrDate: '1900 - 1903',
        description: 'Fundé el semanario Regeneración para denunciar las arbitrariedades de la dictadura y exhibimos el histórico crespón negro en El Hijo del Ahuizote el 5 de febrero de 1903.',
        imageUrl: '/images/history/magon_regeneracion_constitucion.jpg',
        locationName: 'Centro Histórico, Ciudad de México',
        coordinates: { lat: 19.4357, lng: -99.1312 },
        narrativeCaption: 'La prensa libre es el faro que despierta la conciencia de los oprimidos.'
      },
      {
        id: 'rfm-m2',
        title: 'Programa del Partido Liberal Mexicano',
        yearOrDate: '1 de Julio de 1906',
        description: 'Publicamos en el exilio el manifiesto obrero y agrario que inspiró directamente los artículos 3.º, 27 y 123 de nuestra Constitución social.',
        imageUrl: '/images/history/magon_programa_plm_1906.jpg',
        locationName: 'Saint Louis, Misuri / Norteamérica',
        coordinates: { lat: 38.6270, lng: -90.1994 },
        narrativeCaption: 'Sin jornada justa, salario digno y escuela laica, ninguna revolución está completa.'
      }
    ],
    keyLocations: [
      {
        id: 'rfm-loc1',
        name: 'Eloxochitlán de Flores Magón',
        stateOrCountry: 'Oaxaca, México',
        coordinates: { lat: 18.1753, lng: -96.8736 },
        significance: 'Comunidad de la Sierra Mazateca donde nací y aprendí el respeto a la vida comunitaria.',
        imageUrl: '/images/history/magon_baja_california_1911.jpg'
      },
      {
        id: 'rfm-loc2',
        name: 'Penitenciaría Federal de Leavenworth',
        stateOrCountry: 'Kansas, Estados Unidos',
        coordinates: { lat: 39.3292, lng: -94.9333 },
        significance: 'Prisión donde mantuve intactos mis principios hasta mi último día el 21 de noviembre de 1922.',
        imageUrl: '/images/history/magon_prision_leavenworth.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'rfm-vq1',
        question: '¿Qué conquistas sociales exigió el Programa del Partido Liberal Mexicano en 1906?',
        options: ['Jornada máxima de 8 horas, salario mínimo, prohibición del trabajo infantil y educación laica', 'Monopolios ferroviarios privados', 'Eliminación del ejido', 'Impuesto único al campesino'],
        correctIndex: 0,
        explanation: 'Nuestro programa de 1906 sentó las bases directas de los derechos laborales y agrarios constitucionales.'
      },
      {
        id: 'rfm-vq2',
        question: '¿Por qué rechacé pedir indulto en prisión a pesar de estar enfermo y casi ciego?',
        options: ['Porque jamás claudicaría en mis principios de justicia y dignidad obrera', 'Porque esperaba ser coronado', 'Porque desconocía mi idioma', 'Por miedo a regresar a Oaxaca'],
        correctIndex: 0,
        explanation: 'Mi conciencia valía más que la libertad comprada mediante el arrepentimiento de luchar por los humildes.'
      }
    ]
  },
  {
    match: /guadalupe\s+victoria/i,
    characterName: 'Guadalupe Victoria',
    avatarImageUrl: '/images/history/guadalupe_victoria_avatar.png',
    birthDeathDates: '1786 - 1843',
    historicalEra: 'Consumación y Primera República Federal',
    shortBio: 'Fui el primer Presidente Constitucional de los Estados Unidos Mexicanos (1824-1829) tras combatir sin rendirme en las selvas de Veracruz por nuestra República.',
    moments: [
      {
        id: 'gvic-m1',
        title: 'El Salto del Río Jalatlaco en Oaxaca',
        yearOrDate: '25 de Noviembre de 1812',
        description: 'Arrojé mi espada al otro lado del caudaloso río bajo el fuego enemigo exclamando "¡Va mi espada en prenda, voy por ella!" y crucé a nado para abrir el paso a los insurgentes.',
        imageUrl: '/images/history/victoria_rio_jalatlaco.jpg',
        locationName: 'Ciudad de Oaxaca, Oaxaca',
        coordinates: { lat: 17.0606, lng: -96.7256 },
        narrativeCaption: 'Un jefe insurgente abre el camino frente al fuego con valor inquebrantable.'
      },
      {
        id: 'gvic-m2',
        title: 'Juramento de la Primera Presidencia Constitucional y Capitulación de Ulúa',
        yearOrDate: '1824 - 1825',
        description: 'Asumí la primera presidencia republicana bajo la Constitución Federal de 1824, consolidé la rendición del último reducto español en San Juan de Ulúa y fundé el Museo Nacional.',
        imageUrl: '/images/history/victoria_jura_presidencia_1824.jpg',
        locationName: 'Ciudad de México y Veracruz',
        coordinates: { lat: 19.2094, lng: -96.1314 },
        narrativeCaption: 'La República Federal mexicana se sostiene con legalidad, soberanía y honor.'
      }
    ],
    keyLocations: [
      {
        id: 'gvic-loc1',
        name: 'Fortaleza de San Juan de Ulúa y Perote',
        stateOrCountry: 'Veracruz, México',
        coordinates: { lat: 19.2094, lng: -96.1314 },
        significance: 'Teatro de la capitulación española de 1825 y mi última morada en la Fortaleza de San Carlos.',
        imageUrl: '/images/history/victoria_san_juan_ulua.jpg'
      },
      {
        id: 'gvic-loc2',
        name: 'Selvas de Huatusco y Monte Blanco',
        stateOrCountry: 'Veracruz, México',
        coordinates: { lat: 19.1481, lng: -96.9678 },
        significance: 'Serranías donde resistí en soledad sin aceptar el indulto realista.',
        imageUrl: '/images/history/victoria_selva_resistencia.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'gvic-vq1',
        question: '¿Qué logro constitucional inédito alcancé como primer presidente de México entre 1824 y 1829?',
        options: ['Concluí íntegro mi periodo constitucional de cuatro años', 'Fui coronado emperador vitalicio', 'Cerré todas las escuelas públicas', 'Disolví la Constitución de 1824'],
        correctIndex: 0,
        explanation: 'Completé mi mandato presidencial constitucional íntegro defendiendo siempre las leyes de 1824.'
      },
      {
        id: 'gvic-vq2',
        question: '¿Qué último reducto militar español capituló ante nuestra marina republicana en noviembre de 1825?',
        options: ['San Juan de Ulúa', 'El Castillo de Chapultepec', 'Alhóndiga de Granaditas', 'Cerro de las Campanas'],
        correctIndex: 0,
        explanation: 'El bloqueo marítimo republicano forzó la capitulación final española en San Juan de Ulúa.'
      }
    ]
  },
  {
    match: /quintana\s+roo/i,
    characterName: 'Andrés Quintana Roo',
    avatarImageUrl: '/images/history/andres_quintana_roo_avatar.png',
    birthDeathDates: '1787 - 1851',
    historicalEra: 'Congreso de Anáhuac y Letras Patrias',
    shortBio: 'Presidí el Congreso de Anáhuac en Chilpancingo y redacté el Acta Solemne de la Declaración de Independencia de la América Septentrional en 1813.',
    moments: [
      {
        id: 'aqr-m1',
        title: 'Redacción del Acta de Independencia en Chilpancingo',
        yearOrDate: '6 de Noviembre de 1813',
        description: 'Presidiendo el Congreso de Anáhuac di forma jurídica al Acta Solemne que declaró rota para siempre la dependencia del trono español.',
        imageUrl: '/images/history/quintana_acta_independencia.jpg',
        locationName: 'Chilpancingo, Guerrero',
        coordinates: { lat: 17.5514, lng: -99.5008 },
        narrativeCaption: 'La pluma y la ley consagran el derecho sagrado de nuestra patria a gobernarse por sí misma.'
      },
      {
        id: 'aqr-m2',
        title: 'Imprenta Insurgente de Sultepec',
        yearOrDate: '1812',
        description: 'Fundimos tipos de madera y plomo en las serranías de Sultepec para publicar El Ilustrador Americano y defender nuestras razones libertarias.',
        imageUrl: '/images/history/quintana_prensa_sultepec.jpg',
        locationName: 'Sultepec, Estado de México',
        coordinates: { lat: 18.8436, lng: -99.9547 },
        narrativeCaption: 'Cada pliego impreso en la sierra llevó luz jurídica a toda la América Septentrional.'
      }
    ],
    keyLocations: [
      {
        id: 'aqr-loc1',
        name: 'Chilpancingo de los Bravo',
        stateOrCountry: 'Guerrero, México',
        coordinates: { lat: 17.5514, lng: -99.5008 },
        significance: 'Sede del Congreso de Anáhuac donde redacté el Acta de 1813.',
        imageUrl: '/images/history/quintana_clandestinidad_leona.jpg'
      },
      {
        id: 'aqr-loc2',
        name: 'Academia de San Juan de Letrán',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4335, lng: -99.1408 },
        significance: 'Tertulia literaria que fundé en 1836 para impulsar las letras nacionales mexicanas.',
        imageUrl: '/images/history/quintana_academia_letran.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'aqr-vq1',
        question: '¿Qué documento jurídico histórico redacté el 6 de noviembre de 1813 en el Congreso de Anáhuac?',
        options: ['El Acta Solemne de la Declaración de Independencia de la América Septentrional', 'Las Leyes de Reforma', 'El Tratado de Guadalupe Hidalgo', 'El Plan de Ayala'],
        correctIndex: 0,
        explanation: 'Como presidente del Congreso redacté el Acta de Chilpancingo declarando nuestra independencia formal.'
      },
      {
        id: 'aqr-vq2',
        question: '¿Qué institución fundé en 1836 para promover la literatura mexicana independiente?',
        options: ['La Academia de San Juan de Letrán', 'El Museo de Historia Natural', 'La Real Audiencia', 'El Observatorio de Tacubaya'],
        correctIndex: 0,
        explanation: 'Presidí la Academia de San Juan de Letrán congregando a la primera generación literaria nacional.'
      }
    ]
  },
  {
    match: /posada/i,
    characterName: 'José Guadalupe Posada',
    avatarImageUrl: '/images/history/jose_guadalupe_posada_avatar.png',
    birthDeathDates: '1852 - 1913',
    historicalEra: 'Arte Gráfico y Crónica Popular Mexicana',
    shortBio: 'Grabé en placas de zinc la vida del pueblo mexicano y di vida a la Calavera Garbancera, recordando que ante la muerte todos somos iguales.',
    moments: [
      {
        id: 'jgp-m1',
        title: 'El Taller Tipográfico frente a Santa Inés',
        yearOrDate: '1890 - 1912',
        description: 'En la imprenta de Antonio Vanegas Arroyo ilustré más de quince mil hojas volantes, corridos y gacetas populares que relataban las inquietudes y sátiras de nuestro pueblo.',
        imageUrl: '/images/history/posada_hojas_volantes.jpg',
        locationName: 'Calle de Moneda / Santa Inés, Ciudad de México',
        coordinates: { lat: 19.4331, lng: -99.1301 },
        narrativeCaption: 'El buril y la tinta ponen al alcance del pueblo la crítica mordaz y la memoria cotidiana.'
      },
      {
        id: 'jgp-m2',
        title: 'Creación de La Calavera Garbancera',
        yearOrDate: '1910 - 1912',
        description: 'Grabé mi calavera ataviada con sombrero francés elegante pero desnuda de ropas para satirizar a quienes renegaban de sus raíces indígenas.',
        imageUrl: '/images/history/posada_calavera_garbancera.jpg',
        locationName: 'Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        narrativeCaption: 'La muerte es democrática: ricos y pobres terminamos siendo iguales bajo la tierra.'
      }
    ],
    keyLocations: [
      {
        id: 'jgp-loc1',
        name: 'Aguascalientes (Barrio de San Marcos y Taller Gráfico)',
        stateOrCountry: 'Aguascalientes, México',
        coordinates: { lat: 21.8794, lng: -102.2994 },
        significance: 'Mi ciudad natal donde aprendí el oficio de litógrafo y grabador.',
        imageUrl: '/images/history/posada_taller_aguascalientes.jpg'
      },
      {
        id: 'jgp-loc2',
        name: 'Centro Histórico de la Ciudad de México',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4331, lng: -99.1301 },
        significance: 'Corazón de mi taller gráfico frente a la Iglesia de Santa Inés.',
        imageUrl: '/images/history/posada_mural_rivera.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'jgp-vq1',
        question: '¿Cómo titulé originalmente al grabado conocido hoy mundialmente como La Catrina?',
        options: ['La Calavera Garbancera', 'La Reina del Barrio', 'Dama del Bajío', 'Crónica de Santa Clara'],
        correctIndex: 0,
        explanation: 'La llamé La Calavera Garbancera para criticar el desprecio hacia lo propio y exaltar la igualdad popular.'
      },
      {
        id: 'jgp-vq2',
        question: '¿En qué medio circulaban masivamente mis grabados e ilustraciones satíricas?',
        options: ['En hojas volantes y gacetas callejeras editadas con Antonio Vanegas Arroyo', 'Exclusivamente en lienzos reales', 'En libros reservados a nobles europeos', 'En sellos de lacre imperial'],
        correctIndex: 0,
        explanation: 'Nuestras hojas sueltas costaban pocos centavos y llegaban a mercados, ferias y barrios populares.'
      }
    ]
  },
  {
    match: /calles/i,
    characterName: 'Plutarco Elías Calles',
    avatarImageUrl: '/images/history/plutarco_elias_calles_avatar.png',
    birthDeathDates: '1877 - 1945',
    historicalEra: 'Construcción Institucional Posrevolucionaria',
    shortBio: 'Desde la Presidencia de la República fundé el Banco de México y declaré en 1928 el paso histórico de la era de los caudillos a la era de las instituciones.',
    moments: [
      {
        id: 'pec-m1',
        title: 'Fundación del Banco de México y Banca Pública',
        yearOrDate: '1 de Septiembre de 1925',
        description: 'Creé nuestro banco central único emisor de moneda junto con el Banco Nacional de Crédito Agrícola y la red nacional de carreteras para modernizar el país.',
        imageUrl: '/images/history/calles_banco_mexico.jpg',
        locationName: 'Centro Histórico, Ciudad de México',
        coordinates: { lat: 19.4357, lng: -99.1394 },
        narrativeCaption: 'La soberanía económica nacional exige instituciones financieras sólidas y transparentes.'
      },
      {
        id: 'pec-m2',
        title: 'Mensaje Histórico sobre el Fin de los Caudillos',
        yearOrDate: '1 de Septiembre de 1928',
        description: 'Ante el Congreso de la Unión afirmé que México debía pasar definitivamente del gobierno personalista de caudillos a una nación guiada por instituciones y partidos.',
        imageUrl: '/images/history/calles_informe_1928.jpg',
        locationName: 'Cámara de Diputados, Ciudad de México',
        coordinates: { lat: 19.4368, lng: -99.1375 },
        narrativeCaption: 'Ha llegado la hora de consolidar una patria gobernada por leyes e instituciones duraderas.'
      }
    ],
    keyLocations: [
      {
        id: 'pec-loc1',
        name: 'Banco de México (Avenida 5 de Mayo)',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4357, lng: -99.1394 },
        significance: 'Institución financiera fundada en 1925 para estabilizar la moneda nacional.',
        imageUrl: '/images/history/calles_fundacion_pnr.jpg'
      },
      {
        id: 'pec-loc2',
        name: 'Guaymas, Sonora',
        stateOrCountry: 'Sonora, México',
        coordinates: { lat: 27.9211, lng: -110.8975 },
        significance: 'Puerto sonorense donde ejercí como maestro escolar antes de unirme al constitucionalismo.',
        imageUrl: '/images/history/calles_guerra_cristera.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'pec-vq1',
        question: '¿Qué institución financiera central creé el 1 de septiembre de 1925?',
        options: ['El Banco de México', 'La Real Casa de Moneda Colonial', 'El Monte de Piedad Virreinal', 'La Tesorería de San Carlos'],
        correctIndex: 0,
        explanation: 'Fundé el Banco de México como único emisor soberano de nuestra moneda nacional.'
      },
      {
        id: 'pec-vq2',
        question: '¿Qué transición histórica proclamé en mi último informe presidencial de 1928?',
        options: ['Pasar de un país de caudillos a una nación de instituciones y leyes', 'Restablecer el imperio', 'Suprimir el voto municipal', 'Volver al virreinato'],
        correctIndex: 0,
        explanation: 'Llamé a encauzar los conflictos políticos por vías institucionales estables.'
      }
    ]
  },
  {
    match: /d[ií]az\s+ordaz/i,
    characterName: 'Gustavo Díaz Ordaz',
    avatarImageUrl: '/images/history/gustavo_diaz_ordaz_avatar.png',
    birthDeathDates: '1911 - 1979',
    historicalEra: 'México Contemporáneo y Desarrollo Estabilizador',
    shortBio: 'Ejercí la presidencia de México de 1964 a 1970 durante la firma del Tratado de Tlatelolco, la restitución de El Chamizal y la construcción del Metro.',
    moments: [
      {
        id: 'gdo-m1',
        title: 'Firma del Tratado de Tlatelolco y Devolución de El Chamizal',
        yearOrDate: '1967',
        description: 'En mi mandato se firmó en Tlatelolco el tratado pionero de no proliferación nuclear en América Latina y recibimos físicamente el territorio recuperado de El Chamizal en Ciudad Juárez.',
        imageUrl: '/images/history/diaz_ordaz_chamizal.jpg',
        locationName: 'Tlatelolco, CDMX y Ciudad Juárez, Chihuahua',
        coordinates: { lat: 31.7667, lng: -106.4500 },
        narrativeCaption: 'La diplomacia mexicana promovió el desarme nuclear continental y la recuperación territorial.'
      },
      {
        id: 'gdo-m2',
        title: 'Inauguración del Sistema de Transporte Colectivo Metro',
        yearOrDate: '4 de Septiembre de 1969',
        description: 'Inauguramos la primera línea del Metro de la Ciudad de México (Zaragoza-Chapultepec) para modernizar la movilidad urbana de la capital.',
        imageUrl: '/images/history/diaz_ordaz_metro_1969.jpg',
        locationName: 'Ciudad de México',
        coordinates: { lat: 19.4209, lng: -99.1332 },
        narrativeCaption: 'La infraestructura urbana y el tratado de paz nuclear marcaron obras decisivas de aquel sexenio.'
      }
    ],
    keyLocations: [
      {
        id: 'gdo-loc1',
        name: 'Tlatelolco (Secretaría de Relaciones Exteriores de 1967 y Plaza de las Tres Culturas)',
        stateOrCountry: 'Ciudad de México',
        coordinates: { lat: 19.4510, lng: -99.1372 },
        significance: 'Escenario tanto del Tratado de Tlatelolco como de los graves acontecimientos del 2 de octubre de 1968.',
        imageUrl: '/images/history/diaz_ordaz_tlatelolco_tratado.jpg'
      },
      {
        id: 'gdo-loc2',
        name: 'Parque Federal El Chamizal',
        stateOrCountry: 'Ciudad Juárez, Chihuahua',
        coordinates: { lat: 31.7667, lng: -106.4500 },
        significance: 'Territorio fronterizo reintegrado formalmente a la soberanía mexicana en 1967.',
        imageUrl: '/images/history/diaz_ordaz_informe_1969.jpg'
      }
    ],
    verificationQuestions: [
      {
        id: 'gdo-vq1',
        question: '¿Qué acuerdo internacional multilateral sobre desarme se firmó en México en febrero de 1967?',
        options: ['El Tratado de Tlatelolco para la proscripción de armas nucleares en América Latina', 'El Pacto de Xochimilco', 'El Plan de San Luis', 'La Constitución de Cádiz'],
        correctIndex: 0,
        explanation: 'El Tratado de Tlatelolco convirtió a América Latina en zona libre de armamento nuclear.'
      },
      {
        id: 'gdo-vq2',
        question: '¿Qué territorio fronterizo en Ciudad Juárez fue entregado materialmente a México en 1967?',
        options: ['El Chamizal', 'Veracruz', 'Soconusco', 'San Juan de Ulúa'],
        correctIndex: 0,
        explanation: 'Se consumó la entrega física de El Chamizal reintegrando esas tierras al territorio nacional.'
      }
    ]
  }
];

/**
 * Construye datos completos en 1ª persona para cualquier personaje o sitio histórico del catálogo o personalizado
 */
export function buildDynamicHistoricalFigureData(
  characterOrSiteName?: string,
  indexFallback: number = 0,
  isGeographicSite: boolean = false
): HistoricalFigureBlockData {
  if (characterOrSiteName && characterOrSiteName.trim()) {
    const clean = characterOrSiteName.trim().toLowerCase();
    const matched = HISTORICAL_FIGURES_PRESET_CATALOG.find(
      (fig) =>
        fig.characterName.toLowerCase().includes(clean) ||
        clean.includes(fig.characterName.toLowerCase()) ||
        (fig.vaultNodeSlug && clean.includes(fig.vaultNodeSlug.replace(/_/g, ' ')))
    );
    if (matched) {
      return JSON.parse(JSON.stringify(matched));
    }

    const vaultQuick = VAULT_22_QUICK_LOOKUP.find((item) => item.match.test(clean));
    if (vaultQuick) {
      return {
        characterName: vaultQuick.characterName,
        characterOrSiteName: vaultQuick.characterName,
        isGeographicSite: !!vaultQuick.isGeographicSite,
        historicalEra: vaultQuick.historicalEra,
        birthDeathDates: vaultQuick.birthDeathDates,
        shortBio: vaultQuick.shortBio,
        firstPersonGreeting: vaultQuick.shortBio,
        detailedContext: vaultQuick.shortBio,
        avatarImageUrl: vaultQuick.avatarImageUrl,
        bookSpineStyle: 'diario_republicano',
        isFromVault: true,
        moments: JSON.parse(JSON.stringify(vaultQuick.moments)),
        keyLocations: JSON.parse(JSON.stringify(vaultQuick.keyLocations)),
        verificationQuestions: JSON.parse(JSON.stringify(vaultQuick.verificationQuestions)),
      };
    }

    // Si es un personaje o sitio personalizado aún no en el catálogo rápido, generar estructura en 1ª persona estricta
    const titleName = characterOrSiteName.trim();
    return {
      characterName: titleName,
      characterOrSiteName: titleName,
      isGeographicSite,
      historicalEra: isGeographicSite ? 'Patrimonio Histórico y Cultural' : 'Protagonista de la Historia y las Ciencias',
      birthDeathDates: isGeographicSite ? 'Enclave Histórico' : 'Legado Histórico Verificado',
      shortBio: isGeographicSite
        ? `Soy el enclave histórico de ${titleName}. En mis recintos y coordenadas ocurrieron transformaciones decisivas para la memoria de la humanidad.`
        : `Soy ${titleName}. A lo largo de mi vida impulsé obras, descubrimientos y decisiones que transformaron mi época y dejaron huella en la historia.`,
      firstPersonGreeting: isGeographicSite
        ? `Soy el enclave histórico de ${titleName}. En mis recintos y coordenadas ocurrieron transformaciones decisivas para la memoria de la humanidad.`
        : `Soy ${titleName}. A lo largo de mi vida impulsé obras, descubrimientos y decisiones que transformaron mi época y dejaron huella en la historia.`,
      detailedContext: isGeographicSite
        ? `Explora mis coordenadas geográficas, mi arquitectura y las crónicas documentadas en la Bóveda Curricular.`
        : `Dialoga conmigo en primera persona sobre mis aportaciones, contexto histórico y momentos decisivos.`,
      avatarImageUrl: isGeographicSite
        ? '/images/history/santiago_de_queretaro_avatar.jpg'
        : /leona|vicario/i.test(titleName)
          ? '/images/history/leona_vicario_avatar.webp'
          : '/images/history/personaje_generico_avatar.png',
      bookSpineStyle: isGeographicSite ? 'codice_antiguo' : 'diario_republicano',
      isFromVault: false,
      moments: [
        {
          id: `dyn-m1-${Date.now()}`,
          title: `Orígenes y Contexto de ${titleName}`,
          yearOrDate: 'Etapa Formativa',
          description: isGeographicSite
            ? `En mis primeros asentamientos se trazaron las rutas y edificaciones que definieron mi importancia estratégica.`
            : `Desde mis años de formación forjé los principios y conocimientos que guiaron mi trayectoria histórica.`,
          imageUrl: '/images/history/momento_historico_1.jpg',
          locationName: titleName,
          coordinates: { lat: 19.4326, lng: -99.1332 },
          narrativeCaption: `El inicio de mi legado en la memoria histórica.`
        },
        {
          id: `dyn-m2-${Date.now()}`,
          title: `Aportación Trascendental`,
          yearOrDate: 'Momento Cumbre',
          description: isGeographicSite
            ? `Fui escenario de acontecimientos cruciales que marcaron el rumbo social y cultural de la región.`
            : `Encabecé acciones y aportaciones decisivas frente a los desafíos de mi tiempo.`,
          imageUrl: '/images/history/momento_historico_2.jpg',
          locationName: titleName,
          coordinates: { lat: 20.5931, lng: -100.3928 },
          narrativeCaption: `Cada decisión dejó testimonio documental verificado.`
        }
      ],
      keyLocations: [
        {
          id: `dyn-loc1-${Date.now()}`,
          name: titleName,
          stateOrCountry: 'Ubicación Histórica',
          coordinates: { lat: 19.4326, lng: -99.1332 },
          significance: `Punto clave vinculado a la historia de ${titleName}.`,
          imageUrl: '/images/history/sitio_historico_default.jpg'
        }
      ],
      verificationQuestions: [
        {
          id: `dyn-vq1-${Date.now()}`,
          question: `¿Cuál es la relevancia histórica y formativa de ${titleName} dentro de nuestro estudio?`,
          options: [
            'Sus aportaciones y contexto permiten comprender procesos clave de transformación histórica y científica',
            'No tuvo ninguna relación con su época',
            'Es un elemento meramente ficticio',
            'Carece de registro documental'
          ],
          correctIndex: 0,
          explanation: `El análisis de ${titleName} permite comprender las causas y consecuencias de su periodo histórico.`
        }
      ]
    };
  }

  const chosen = HISTORICAL_FIGURES_PRESET_CATALOG[indexFallback % HISTORICAL_FIGURES_PRESET_CATALOG.length];
  return JSON.parse(JSON.stringify(chosen));
}

/**
 * Metadatos Curriculares Oficiales NEM 2024 para la Gesta de Independencia
 */
export const MEXICAN_INDEPENDENCE_METADATA: ActivityBuilderMetadata = {
  title: 'La Gesta Heroica de la Independencia de México',
  description: 'Secuencia didáctica adaptativa sincronizada con la Bóveda Curricular y el Espejo Ejecutivo CEO. Incluye Personaje Histórico 3D en 1ª Persona, Completar Espacios con Banco Validado, Bifurcación Condicional Real (Ruta Maestría ≥70% vs Ruta Refuerzo <70%), Duelo Boss con Reactivos, Tutor Socrático y Cofre/Diploma.',
  subject: 'Historia y Formación Cívica',
  subjectId: 'sub-hist',
  targetAge: 'Primaria Alta y Secundaria (10 - 15 años)',
  campoFormativo: 'Ética, Naturaleza y Sociedades',
  camposFormativos: ['Ética, Naturaleza y Sociedades', 'Lenguajes'],
  ejesArticuladores: [
    'Pensamiento Crítico',
    'Apropiación de las Culturas a través de la Lectura y la Escritura',
    'Interculturalidad Crítica'
  ],
  faseNem: 'Fase 5',
  pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las causas y las cuatro etapas del movimiento de Independencia de la Nueva España, valorando el ideario de los Sentimientos de la Nación y los derechos de soberanía e igualdad.',
  pdas: [
    'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las causas y las cuatro etapas del movimiento de Independencia de la Nueva España, valorando el ideario de los Sentimientos de la Nación y los derechos de soberanía e igualdad.',
    'Fase 5 - Lenguajes: Produce e interpreta narraciones orales, biografías ilustradas y debates sobre los héroes y heroínas de la Independencia nacional.'
  ],
  taskType: 'activity_flow',
  xpReward: 350,
  coinsReward: 60,
  totalTimeLimit: 0,
  livesCount: 3,
  streakMultiplier: true,
};

/**
 * Flujo Inicial Evolucionado (Rediseño 1 Vista 1.1) — Cero Colisiones, Con Bifurcación Condicional Real
 */
export const MEXICAN_INDEPENDENCE_BLOCKS: StudioBlock[] = [
  // Nodo 1: Personaje o Sitio Histórico 3D (Intercambiable entre los 22+ personajes de la Bóveda Curricular)
  {
    id: 'node-indep-1',
    type: 'historical_figure_block',
    title: '1. Protagonista Histórico 3D (1ª Persona)',
    isCollapsed: false,
    isStartNode: true,
    position: { x: 40, y: 70 },
    data: buildDynamicHistoricalFigureData('Miguel Hidalgo y Costilla', 0)
  } as any,

  // Nodo 2: Completar Espacios con Banco Validado
  {
    id: 'node-indep-2',
    type: 'fill_in_blanks',
    title: '2. Completar Espacios: Conspiración de 1810',
    isCollapsed: false,
    position: { x: 410, y: 35 },
    data: {
      instructions: 'Coloca cada palabra clave en el espacio correspondiente sobre el inicio de la Independencia:',
      textWithBlanks: 'En [Querétaro] se organizaron las juntas secretas; [Ignacio Pérez] cabalgó con el aviso urgente hacia [Dolores] para proclamar la [libertad].',
      wordBank: ['Querétaro', 'Ignacio Pérez', 'Dolores', 'libertad']
    }
  },

  // Nodo 3: Bifurcación Condicional Real (≥ 70% Ruta Maestría vs < 70% Ruta Refuerzo)
  {
    id: 'node-indep-3',
    type: 'logic_branch',
    title: '3. Bifurcación Condicional Real',
    isCollapsed: false,
    position: { x: 410, y: 270 },
    data: {
      conditionType: 'score_above',
      thresholdScore: 70,
      ifTrueNextBlockId: 'node-indep-4a',
      ifFalseNextBlockId: 'node-indep-4b'
    }
  },

  // Nodo 4A (Rama Superior ≥ 70% Ruta Maestría): Duelo Boss Curricular con 5 Reactivos
  {
    id: 'node-indep-4a',
    type: 'boss_enemy',
    title: '4A. Duelo Boss Curricular con 5 Reactivos',
    isCollapsed: false,
    position: { x: 790, y: 45 },
    data: {
      bossName: 'Comandante Realista Torcuato Trujillo',
      maxHp: 1200,
      attackPower: 20,
      spriteKey: 'shadow_golem',
      victoryCondition: 'defeat_boss',
      backgroundScene: 'temple'
    }
  },

  // Nodo 4B (Rama Inferior < 70% Ruta Refuerzo): Tutor Socrático & Cápsula de Apoyo
  {
    id: 'node-indep-4b',
    type: 'languages_socratic_tutor',
    title: '4B. Tutor Socrático & Cápsula de Apoyo',
    isCollapsed: false,
    position: { x: 790, y: 280 },
    data: {
      language: 'en',
      targetLevel: 'B1',
      topicTitle: 'Historical Causes of Mexican Independence (1810)',
      starterPrompt: 'Let us review together: Why did the conspirators in Querétaro send Ignacio Pérez to Dolores on September 15, 1810?',
      socraticDepth: 3,
      targetVocabulary: ['independence', 'freedom', 'sovereignty', 'abolition', 'republic'],
      grammarFocus: 'Past Simple & Historical Cause-Effect Connectors',
      portalUrl: '/teacher/idiomas'
    }
  } as any,

  // Nodo 5: Ordenar Secuencia Cronológica
  {
    id: 'node-indep-5',
    type: 'ordering_sequence',
    title: '5. Las 4 Grandes Etapas de la Independencia',
    isCollapsed: false,
    position: { x: 1170, y: 45 },
    data: {
      instructions: 'Ordena cronológicamente los 4 periodos fundamentales de la gesta heroica (1810 a 1821):',
      randomizeStart: true,
      stepsInCorrectOrder: [
        '1810 - 1811: Etapa de Inicio (Grito de Dolores, toma de la Alhóndiga y Decreto de Abolición con Miguel Hidalgo).',
        '1811 - 1815: Etapa de Organización (Campañas de José María Morelos, Congreso de Chilpancingo y Sentimientos de la Nación).',
        '1815 - 1820: Etapa de Resistencia (Guerra de guerrillas en las montañas del sur con Vicente Guerrero).',
        '1821: Etapa de Consumación (Abrazo de Acatempan, Plan de Iguala y entrada del Ejército Trigarante).'
      ]
    }
  },

  // Nodo 6: Diploma Digital y Cofre de Honor
  {
    id: 'node-indep-6',
    type: 'badge_certificate',
    title: '6. Diploma Oficial & Sello SEP Pág. 48',
    isCollapsed: false,
    position: { x: 1170, y: 280 },
    data: {
      certificateTitle: 'Diploma de Excelencia Histórica SEP NEM',
      honorMessage: 'Por analizar críticamente las causas, protagonistas y etapas de la Independencia de México y superar el reto adaptativo con rigor histórico.',
      signatureTitle: 'Dirección Académica & Espejo Ejecutivo CEO'
    }
  }
];

/**
 * Conexiones Direccionales del Grafo (Incluyendo Ramas de Maestría y Refuerzo)
 */
export const MEXICAN_INDEPENDENCE_CONNECTIONS: FlowConnection[] = [
  { id: 'conn-indep-1-2', sourceNodeId: 'node-indep-1', targetNodeId: 'node-indep-2', label: 'next' },
  { id: 'conn-indep-2-3', sourceNodeId: 'node-indep-2', targetNodeId: 'node-indep-3', label: 'next' },
  { id: 'conn-indep-3-4a', sourceNodeId: 'node-indep-3', targetNodeId: 'node-indep-4a', label: '≥ 70% Ruta Maestría', condition: 'score_high' },
  { id: 'conn-indep-3-4b', sourceNodeId: 'node-indep-3', targetNodeId: 'node-indep-4b', label: '< 70% Ruta Refuerzo', condition: 'score_low' },
  { id: 'conn-indep-4a-5', sourceNodeId: 'node-indep-4a', targetNodeId: 'node-indep-5', label: 'next' },
  { id: 'conn-indep-4b-5', sourceNodeId: 'node-indep-4b', targetNodeId: 'node-indep-5', label: 'next' },
  { id: 'conn-indep-5-6', sourceNodeId: 'node-indep-5', targetNodeId: 'node-indep-6', label: 'success' },
];
