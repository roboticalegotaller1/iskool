import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET() {
  sharp.cache(false);

  const brainDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/857a2b8b-6bf7-44b2-a4b6-0eba05c0008a';
  const outputDir = path.join(process.cwd(), 'public', 'redisenos_assets', 'huellitas');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const itemsToProcess = [
    {
      src: path.join(brainDir, 'oso_detective_bufanda_1792764751554.jpg'),
      dest: path.join(outputDir, 'oso_detective_bufanda.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_gorrito_fiesta_1792764780167.jpg'),
      dest: path.join(outputDir, 'oso_gorrito_fiesta.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_corona_real_1792764803946.jpg'),
      dest: path.join(outputDir, 'oso_corona_real.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_gorro_chef_1792764832605.jpg'),
      dest: path.join(outputDir, 'oso_gorro_chef.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_gorro_dinosaurio_1792764858519.jpg'),
      dest: path.join(outputDir, 'oso_gorro_dinosaurio.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_alas_mariposa_1792764890774.jpg'),
      dest: path.join(outputDir, 'oso_alas_mariposa.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_5_manzanas_1792764929861.jpg'),
      dest: path.join(outputDir, 'oso_5_manzanas.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_base_pedestal_1792764969468.jpg'),
      dest: path.join(outputDir, 'oso_base_pedestal.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_gorro_osito_1792765015335.jpg'),
      dest: path.join(outputDir, 'oso_gorro_osito.jpg'),
      maxDim: 1024,
      quality: 82
    },
    // Fox character renders with items
    {
      src: path.join(brainDir, 'zorro_base_pedestal_1792766953298.jpg'),
      dest: path.join(outputDir, 'zorro_base_pedestal.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'zorro_detective_bufanda_1792767009576.jpg'),
      dest: path.join(outputDir, 'zorro_detective_bufanda.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'zorro_gorrito_fiesta_1792767050460.jpg'),
      dest: path.join(outputDir, 'zorro_gorrito_fiesta.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'zorro_corona_real_1792767112441.jpg'),
      dest: path.join(outputDir, 'zorro_corona_real.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'zorro_gorro_chef_1792767159762.jpg'),
      dest: path.join(outputDir, 'zorro_gorro_chef.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'zorro_gorro_dinosaurio_1792767230434.jpg'),
      dest: path.join(outputDir, 'zorro_gorro_dinosaurio.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'zorro_gorro_osito_1792767276409.jpg'),
      dest: path.join(outputDir, 'zorro_gorro_osito.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'zorro_alas_mariposa_1792767387261.jpg'),
      dest: path.join(outputDir, 'zorro_alas_mariposa.jpg'),
      maxDim: 1024,
      quality: 82
    },
    // Option 02 Hub Image
    {
      src: path.join(brainDir, '.user_uploaded', 'media_1792766466264.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'hub_isla_juguetes.jpg'),
      maxDim: 1280,
      quality: 85
    },
    // Option 02 Individual Assets generated with Nano Banana
    {
      src: path.join(brainDir, 'huevito_azul_nido_1792768149209.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'huevito_azul_nido.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'trenecito_puente_reto_1792768171651.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'trenecito_puente_reto.jpg'),
      maxDim: 1280,
      quality: 82
    },
    {
      src: path.join(brainDir, 'taller_juguete_guardian_1792768193647.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'taller_juguete_guardian.jpg'),
      maxDim: 1280,
      quality: 82
    },
    // Robot Workshop items placed on character (Nano Banana)
    {
      src: path.join(brainDir, 'robot_base_taller_1792769503895.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'robot_base_taller.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'robot_ruedas_tren_1792769348642.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'robot_ruedas_tren.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'robot_capa_superheroe_1792769378979.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'robot_capa_superheroe.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'robot_helices_voladoras_1792769404037.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'robot_helices_voladoras.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'robot_bombillas_magicas_1792769433086.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'robot_bombillas_magicas.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'robot_capa_y_ruedas_1792769465982.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'isla_juguetes', 'robot_capa_y_ruedas.jpg'),
      maxDim: 1024,
      quality: 82
    },
    // Jingle bells for Fox and Bear (Option 01)
    {
      src: path.join(brainDir, 'zorro_cascabeles_1792769541928.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'huellitas', 'zorro_cascabeles.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'oso_cascabeles_1792769578848.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'huellitas', 'oso_cascabeles.jpg'),
      maxDim: 1024,
      quality: 82
    },
    // Option 03 Backgrounds (Uploaded by User)
    {
      src: path.join(brainDir, '.user_uploaded', 'media_1792770779804.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'mapa_guardianes_overworld.jpg'),
      maxDim: 1280,
      quality: 85
    },
    {
      src: path.join(brainDir, '.user_uploaded', 'media_1792770740681.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'personalizador_album_hero.jpg'),
      maxDim: 1280,
      quality: 85
    },
    {
      src: path.join(brainDir, '.user_uploaded', 'media_1792770804250.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'batalla_forest_golem.jpg'),
      maxDim: 1280,
      quality: 85
    },
    {
      src: path.join(brainDir, '.user_uploaded', 'media_1792770808230.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'tienda_recompensas_store.jpg'),
      maxDim: 1280,
      quality: 85
    },
    // Option 03 Characters with Items (Nano Banana)
    {
      src: path.join(brainDir, 'liam_base_pedestal_1792770929364.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'liam_base_pedestal.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'liam_capa_fuego_1792770975250.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'liam_capa_fuego.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'liam_baculo_sabiduria_1792771020286.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'liam_baculo_sabiduria.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'liam_mascota_fenix_1792771065761.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'liam_mascota_fenix.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'liam_corona_100_1792771108064.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'liam_corona_100.jpg'),
      maxDim: 1024,
      quality: 82
    },
    {
      src: path.join(brainDir, 'forest_golem_purificado_1792771156089.jpg'),
      dest: path.join(process.cwd(), 'public', 'redisenos_assets', 'guardianes', 'forest_golem_purificado.jpg'),
      maxDim: 1024,
      quality: 82
    }
  ];

  const results = [];

  for (const item of itemsToProcess) {
    if (!fs.existsSync(item.src)) {
      results.push({ file: path.basename(item.src), status: 'not_found' });
      continue;
    }
    const inputBuf = fs.readFileSync(item.src);
    const processedBuf = await sharp(inputBuf)
      .resize({
        width: item.maxDim,
        height: item.maxDim,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: item.quality, mozjpeg: true })
      .toBuffer();

    fs.mkdirSync(path.dirname(item.dest), { recursive: true });
    fs.writeFileSync(item.dest, processedBuf);
    results.push({
      file: path.basename(item.dest),
      origKb: (inputBuf.length / 1024).toFixed(1),
      compressedKb: (processedBuf.length / 1024).toFixed(1),
      status: 'saved'
    });
  }

  return NextResponse.json({ success: true, results });
}
