const { spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');

if (!fs.existsSync('verify_frames_v3_1')) fs.mkdirSync('verify_frames_v3_1');

const times = [
  { t: '00:00:05', name: 'scene1_teacher_hub.png' },
  { t: '00:00:15', name: 'scene2_student_hero.png' },
  { t: '00:00:26', name: 'scene3_planning_nem.png' },
  { t: '00:00:38', name: 'scene4_studio_canvas.png' },
  { t: '00:00:50', name: 'scene5_student_missions.png' },
  { t: '00:00:62', name: 'scene6_expediente_360.png' },
  { t: '00:00:73', name: 'scene7_parent_portal.png' },
  { t: '00:00:81', name: 'scene8_director_supervision.png' },
  { t: '00:00:87', name: 'scene9_final_cta.png' }
];

times.forEach((item, i) => {
  const outPath = `verify_frames_v3_1/${item.name}`;
  spawnSync(ffmpeg, [
    '-y',
    '-ss', item.t,
    '-i', 'ISkool_Presentacion_Comercial_90s.mp4',
    '-vframes', '1',
    outPath
  ]);
  const sz = fs.existsSync(outPath) ? (fs.statSync(outPath).size / 1024).toFixed(1) + ' KB' : 'ERROR';
  console.log(`Frame ${i + 1} (${item.t}) -> ${item.name}: ${sz}`);
});
