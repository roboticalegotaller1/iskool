// scripts/prepare_redisenos_05_10_assets.mjs
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/0227a18f-11ff-470d-8b55-208b40ddbd6b';
const basePublicDir = path.join(process.cwd(), 'public', 'redisenos_assets');

const tasks = [
  // Caso 05: Crónicas de Exploradores
  {
    src: 'cronicas_explorador_base_1793050408407.jpg',
    folder: 'cronicas',
    destName: 'explorador_base_pedestal.jpg'
  },
  {
    src: 'cronicas_brujula_antigua_1793050429492.jpg',
    folder: 'cronicas',
    destName: 'explorador_brujula_antigua.jpg'
  },
  {
    src: 'cronicas_sombrero_safari_1793050450452.jpg',
    folder: 'cronicas',
    destName: 'explorador_sombrero_safari.jpg'
  },
  {
    src: 'cronicas_mascota_quetzal_1793050498477.jpg',
    folder: 'cronicas',
    destName: 'explorador_mascota_quetzal.jpg'
  },
  {
    src: 'cronicas_poncho_artico_1793050520720.jpg',
    folder: 'cronicas',
    destName: 'explorador_poncho_artico.jpg'
  },

  // Caso 06: Torneo de Saberes TCG
  {
    src: 'tcg_duelista_base_1793050544621.jpg',
    folder: 'torneo_tcg',
    destName: 'duelista_base_pedestal.jpg'
  },
  {
    src: 'tcg_duelista_capa_1793050574985.jpg',
    folder: 'torneo_tcg',
    destName: 'duelista_capa_campeon.jpg'
  },
  {
    src: 'tcg_duelista_visor_1793050609455.jpg',
    folder: 'torneo_tcg',
    destName: 'duelista_visor_tactico.jpg'
  },
  {
    src: 'tcg_duelista_disco_dorado_1793050640994.jpg',
    folder: 'torneo_tcg',
    destName: 'duelista_guante_dragon.jpg'
  },
  {
    src: 'tcg_carta_newton_holo_1793050673278.jpg',
    folder: 'torneo_tcg',
    destName: 'carta_newton_holografica.jpg'
  },

  // Caso 07: Gremio Cyber Esports
  {
    src: 'cyber_gamer_base_1793050705716.jpg',
    folder: 'gremio_cyber',
    destName: 'cyber_gamer_base.jpg'
  },
  {
    src: 'cyber_gamer_auriculares_rgb_1793050747058.jpg',
    folder: 'gremio_cyber',
    destName: 'cyber_gamer_auriculares_rgb.jpg'
  },
  {
    src: 'cyber_gamer_chaqueta_phoenix_1793050787363.jpg',
    folder: 'gremio_cyber',
    destName: 'cyber_gamer_chaqueta_phoenix.jpg'
  },
  {
    src: 'cyber_gamer_gafas_neon_1793050830169.jpg',
    folder: 'gremio_cyber',
    destName: 'cyber_gamer_gafas_neon.jpg'
  },
  {
    src: 'cyber_gamer_guante_haptico_1793050873281.jpg',
    folder: 'gremio_cyber',
    destName: 'cyber_gamer_guante_haptico.jpg'
  },

  // Caso 08: Metrópolis de Inventores
  {
    src: 'inventor_base_taller_1793050921224.jpg',
    folder: 'metropolis',
    destName: 'inventor_base_taller.jpg'
  },
  {
    src: 'inventor_brazo_bionico_1793050971399.jpg',
    folder: 'metropolis',
    destName: 'inventor_brazo_bionico.jpg'
  },
  {
    src: 'inventor_goggles_bronce_1793051023057.jpg',
    folder: 'metropolis',
    destName: 'inventor_goggles_bronce.jpg'
  },
  {
    src: 'inventor_dron_vapor_1793051076602.jpg',
    folder: 'metropolis',
    destName: 'inventor_dron_vapor.jpg'
  },
  {
    src: 'inventor_mochila_tesla_1793051147992.jpg',
    folder: 'metropolis',
    destName: 'inventor_mochila_tesla.jpg'
  },

  // Caso 09: Apex Academy Venture Studio
  {
    src: 'founder_base_pedestal_1793051198903.jpg',
    folder: 'apex_studio',
    destName: 'founder_base_pedestal.jpg'
  },
  {
    src: 'founder_lentes_ar_1793051265255.jpg',
    folder: 'apex_studio',
    destName: 'founder_lentes_ar.jpg'
  },
  {
    src: 'founder_maletin_ejecutivo_1793051323436.jpg',
    folder: 'apex_studio',
    destName: 'founder_maletin_ejecutivo.jpg'
  },
  {
    src: 'founder_pin_unicornio_1793051385504.jpg',
    folder: 'apex_studio',
    destName: 'founder_pin_unicornio.jpg'
  },

  // Caso 10: Nexus Protocol Research Guild
  {
    src: 'investor_base_pedestal_1793051449536.jpg',
    folder: 'nexus_guild',
    destName: 'investigador_base_pedestal.jpg'
  },
  {
    src: 'investigador_neural_band_1793051518296.jpg',
    folder: 'nexus_guild',
    destName: 'investigador_neural_band.jpg'
  },
  {
    src: 'investigador_capa_academica_1793051586106.jpg',
    folder: 'nexus_guild',
    destName: 'investigador_capa_academica.jpg'
  },
  {
    src: 'investigador_relicario_cuantico_1793051650808.jpg',
    folder: 'nexus_guild',
    destName: 'investigador_relicario_cuantico.jpg'
  }
];

async function run() {
  console.log(`🚀 Iniciando compresión y distribución de ${tasks.length} activos dinámicos...`);
  
  for (const item of tasks) {
    const srcPath = path.join(brainDir, item.src);
    const targetFolder = path.join(basePublicDir, item.folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    const destPath = path.join(targetFolder, item.destName);

    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true })
        .toFile(destPath);
      
      const stats = fs.statSync(destPath);
      console.log(`✅ [${item.folder}] ${item.destName} -> ${(stats.size / 1024).toFixed(1)} KB`);
    } else {
      console.warn(`⚠️ Archivo fuente no encontrado: ${srcPath}`);
    }
  }

  console.log('🎉 Todos los activos han sido comprimidos y organizados.');
}

run().catch(err => {
  console.error('❌ Error procesando imágenes:', err);
  process.exit(1);
});
