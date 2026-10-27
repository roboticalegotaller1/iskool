import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const gearItems = [
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/0227a18f-11ff-470d-8b55-208b40ddbd6b/gear_chamarra_neo_estilo_1793073408797.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/gear_chamarra_neo_estilo.jpg'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/0227a18f-11ff-470d-8b55-208b40ddbd6b/gear_gafas_hologen_1793073428648.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/gear_gafas_hologen.jpg'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/0227a18f-11ff-470d-8b55-208b40ddbd6b/gear_gafas_visor_x_1793073446319.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/gear_gafas_visor_x.jpg'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/0227a18f-11ff-470d-8b55-208b40ddbd6b/gear_chaleco_visor_x_1793073466597.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/gear_chaleco_visor_x.jpg'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/0227a18f-11ff-470d-8b55-208b40ddbd6b/gear_mochila_tech_b_1793073498035.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/gear_mochila_tech_b.jpg'
  },
  {
    src: 'C:/Users/kami-/.gemini/antigravity-ide/brain/0227a18f-11ff-470d-8b55-208b40ddbd6b/gear_camiseta_gtr_1793073520285.jpg',
    dest: 'public/redisenos_assets/gremio_cyber/gear_camiseta_gtr.jpg'
  }
];

async function run() {
  for (const item of gearItems) {
    if (!fs.existsSync(item.src)) {
      console.error(`Not found: ${item.src}`);
      continue;
    }
    const info = await sharp(item.src)
      .resize({ width: 720, height: 720, fit: 'cover' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(item.dest);
    console.log(`Compressed: ${item.dest} (${(info.size / 1024).toFixed(1)} KB)`);
  }
}

run().catch(console.error);
