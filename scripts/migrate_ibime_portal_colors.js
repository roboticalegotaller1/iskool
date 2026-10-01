const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'app', 'ibime', 'portal', 'page.tsx');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Reemplazos de encabezados y fondos
code = code.split('bg-[#047857]').join('bg-[#0F2744]');
code = code.split('text-[#047857]').join('text-[#E41B14]');
code = code.split('border-emerald-800').join('border-blue-900');
code = code.split('border-emerald-900').join('border-blue-950');
code = code.split('border-emerald-700').join('border-blue-800');
code = code.split('border-emerald-600').join('border-blue-700');
code = code.split('border-emerald-500').join('border-red-400');
code = code.split('border-emerald-300').join('border-red-300');
code = code.split('border-emerald-200').join('border-red-200');

// 2. Banner de bienvenida
code = code.replace(
  'from-[#047857] via-[#065F46] to-[#0B2545]',
  'from-[#0F2744] via-[#17426D] to-[#800F0A]'
);

// 3. Logo en Header CEO (reemplazar iniciales IB por el logo oficial)
const oldCeoLogo = `<div className="w-11 h-11 rounded-2xl bg-white text-[#047857] flex items-center justify-center font-black text-xl shadow-md border border-emerald-300 shrink-0">
                IB
              </div>`;
const newCeoLogo = `<div className="p-1 rounded-2xl bg-white shadow-md border border-slate-200 shrink-0 flex items-center justify-center">
                <IbimeOfficialLogo size={42} showText={false} />
              </div>`;
if (code.includes('IB\n              </div>')) {
  code = code.replace(/<div className="w-11 h-11 rounded-2xl bg-white[^>]*>[\s\n]*IB[\s\n]*<\/div>/, newCeoLogo);
}

// 4. Badges y textos en header
code = code.split('Instituto Bilingüe IBIME').join('Instituto Bilingüe Ibime');
code = code.split("style={{ color: '#047857' }}").join("style={{ color: '#E41B14' }}");
code = code.split('bg-emerald-50 text-[#047857]').join('bg-red-50 text-[#E41B14]');
code = code.split('bg-emerald-900/80 text-emerald-200').join('bg-[#0B1E36] text-blue-200');
code = code.split('text-emerald-100').join('text-blue-100');
code = code.split('text-emerald-200').join('text-blue-200');
code = code.split('text-emerald-300').join('text-blue-300');
code = code.split('bg-emerald-300').join('bg-red-400');
code = code.split('bg-emerald-800').join('bg-[#17426D]');
code = code.split('bg-emerald-950').join('bg-[#0A1A2E]');
code = code.split('CCT 09PPR1492Z').join('CCT 15PPR3322G');

// 5. Botones de header
code = code.replace(
  'bg-emerald-700/90 hover:bg-emerald-600',
  'bg-[#17426D] hover:bg-[#1E5285]'
);
code = code.replace(
  'bg-white text-[#047857] hover:bg-emerald-50',
  'bg-white text-[#0F2744] hover:bg-slate-100'
);

// 6. Tabs
code = code.split('dark:bg-emerald-950 text-[#047857] dark:text-emerald-300').join('dark:bg-slate-900 text-[#E41B14] dark:text-red-400');
code = code.split('bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200').join('bg-red-100 dark:bg-red-950 text-[#E41B14] dark:text-red-300');

// 7. Clases varias de emerald
code = code.split('text-emerald-600').join('text-[#E41B14]');
code = code.split('text-emerald-700').join('text-[#C01D0C]');
code = code.split('text-emerald-400').join('text-red-400');
code = code.split('bg-emerald-600').join('bg-[#E41B14]');
code = code.split('bg-emerald-700').join('bg-[#C01D0C]');
code = code.split('bg-emerald-50').join('bg-red-50');
code = code.split('bg-emerald-100').join('bg-red-100');
code = code.split('focus:border-emerald-500').join('focus:border-[#E41B14]');

fs.writeFileSync(targetPath, code, 'utf8');
console.log('✅ Updated src/app/ibime/portal/page.tsx successfully!');
