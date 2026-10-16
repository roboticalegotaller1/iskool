import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  Scale,
  UserCheck,
  AlertTriangle,
  School,
  Lock,
  Clock,
  HelpCircle,
  ExternalLink,
  Mail,
  CheckCircle2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Condiciones del Servicio | ISkool - Plataforma Educativa',
  description:
    'Condiciones del Servicio y Términos de Uso oficiales y públicos de la aplicación ISkool. Conoce las normas de uso, autenticación institucional con Google y derechos de la comunidad educativa.',
  alternates: {
    canonical: 'https://iskool.mx/terminos'
  }
};

export default function TermsOfServicePage() {
  const lastUpdated = '16 de octubre de 2026';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ========================================================= */}
      {/* 1. ENCABEZADO INSTITUCIONAL PÚBLICO                       */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
              iS
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                ISkool
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Legal
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Ecosistema de Gestión Escolar y Aprendizaje Gamificado
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
            <Link
              href="/privacidad"
              className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Política de Privacidad
            </Link>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              Condiciones del Servicio
            </span>
          </nav>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO PRINCIPAL                                         */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white py-12 sm:py-16 border-b border-indigo-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Scale className="h-4 w-4 text-indigo-400" />
            <span>Documento Legal Oficial y Público</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Condiciones del Servicio de la Aplicación ISkool
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Bienvenido a ISkool. Al acceder, registrarte o utilizar nuestra plataforma web y móvil en <strong>https://iskool.mx</strong>, aceptas de forma libre e informada sujetarte a las presentes Condiciones del Servicio, diseñadas para salvaguardar la convivencia escolar, la seguridad académica y la integridad tecnológica.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              Última actualización: <strong>{lastUpdated}</strong>
            </span>
            <span>•</span>
            <span>Dominio Oficial: <strong>https://iskool.mx</strong></span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. RESUMEN EJECUTIVO Y ENLACE CRUZADO                     */}
      {/* ========================================================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Bases de Uso Responsable e Integración con Cuentas de Google
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                ISkool permite a los miembros de la comunidad educativa iniciar sesión de forma ágil y segura utilizando su cuenta de Google. Toda interacción respeta la privacidad de los estudiantes y docentes, en estricto apego a nuestra{' '}
                <Link href="/privacidad" className="underline font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                  Política de Privacidad
                </Link>{' '}
                y a las normativas educativas vigentes en México.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. CONTENIDO COMPLETO Y EXHAUSTIVO DE CONDICIONES         */}
      {/* ========================================================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Sección 1 */}
        <section id="aceptacion" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Scale className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              1. Aceptación de los Términos
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Las presentes Condiciones del Servicio regulan el acceso y uso de la plataforma digital, servicios en la nube, aplicaciones web, APIs y herramientas didácticas proporcionadas por <strong>ISkool</strong> a través del portal <strong>https://iskool.mx</strong>.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Al registrar una cuenta, ingresar mediante inicio de sesión federado (Google Sign-In), o hacer uso de cualquiera de los módulos de ISkool, el usuario (o su tutor legal en caso de menores de edad) manifiesta su conformidad plena e incondicional con estos términos. Si no estás de acuerdo con alguna de estas disposiciones, deberás abstenerte de utilizar la plataforma.
          </p>
        </section>

        {/* Sección 2 */}
        <section id="descripcion-servicio" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <School className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              2. Descripción del Servicio y Ecosistema ISkool
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ISkool es un software educativo en la nube (SaaS) diseñado para optimizar los procesos de enseñanza y gestión escolar, proveyendo:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Planeaciones Pedagógicas NEM 2024:</strong>
              Generación, consulta y resguardo de planeaciones curriculares con PDAs oficiales de la SEP.
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Portales Segmentados por Rol:</strong>
              Experiencias personalizadas e independientes para Directores, Docentes, Alumnos y Padres de Familia.
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Ecosistema Colaborativo (Work OS):</strong>
              Canalización de expedientes, tareas delegadas, seguimiento de SLAs y bóveda central de evidencias.
            </li>
            <li className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Aprendizaje Gamificado y Avatares:</strong>
              Entornos lúdicos seguros para incentivar el progreso de los estudiantes en sus materias clave.
            </li>
          </ul>
        </section>

        {/* Sección 3 */}
        <section id="cuentas-google" className="space-y-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <UserCheck className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              3. Cuentas de Usuario y Autenticación Segura con Google
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p>
              El acceso a ISkool requiere una cuenta de usuario asignada por una institución educativa asociada o creada mediante el inicio de sesión federado con Google OAuth 2.0.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">Obligaciones del Usuario respecto a su cuenta:</h3>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Proporcionar información fidedigna y mantener actualizada su dirección de correo electrónico institucional o personal.</li>
                <li>Preservar la confidencialidad de sus credenciales de acceso y dispositivos autorizados.</li>
                <li>Notificar de inmediato a la dirección de su colegio o a <strong>soporte@iskool.mx</strong> ante cualquier sospecha de acceso no autorizado.</li>
                <li>Queda estrictamente prohibida la cesión, venta o préstamo de cuentas escolares a terceros ajenos a la institución educativa.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección 4 */}
        <section id="conducta" className="space-y-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              4. Uso Aceptable y Conductas Prohibidas
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            El entorno de ISkool es un espacio escolar orientado al respeto, la ética y el aprendizaje. Queda terminantemente prohibido a cualquier usuario:
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
              <strong>Conductas de Acoso o Bullying:</strong> Transmitir mensajes amenazantes, difamatorios, de odio, discriminatorios o que atenten contra la dignidad de estudiantes, profesores o personal escolar.
            </li>
            <li className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
              <strong>Vulneración Tecnológica:</strong> Intentar eludir los perímetros de seguridad, realizar inyección de código malicioso, pruebas no autorizadas de penetración o intentar acceder a información de otros colegios (violación de multi-tenancy).
            </li>
            <li className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
              <strong>Alteración de Registros:</strong> Falsificar calificaciones, expedientes médicos, justificaciones de faltas o certificados oficiales emitidos por la plataforma.
            </li>
          </ul>
        </section>

        {/* Sección 5 */}
        <section id="propiedad-intelectual" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Lock className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              5. Propiedad Intelectual y Titularidad de Contenidos
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              <strong>Software y Plataforma:</strong> Los derechos de autor, código fuente, marcas registradas, interfaces visuales, algoritmos y logotipos de ISkool son propiedad exclusiva de ISkool Tecnologías Educativas y están protegidos por las leyes de propiedad intelectual e industrial aplicables en México y tratados internacionales.
            </p>
            <p>
              <strong>Contenidos Escolares y del Docente:</strong> Las instituciones educativas y los docentes conservan en todo momento la titularidad y derechos de autor sobre las planeaciones, tareas, evaluaciones y materiales educativos que elaboren y publiquen en la plataforma. ISkool únicamente cuenta con una licencia técnica de hospedaje y procesamiento para brindar el servicio educativo.
            </p>
          </div>
        </section>

        {/* Sección 6 */}
        <section id="disponibilidad" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              6. Disponibilidad del Servicio y Garantías
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ISkool opera bajo estándares de infraestructura en la nube de alta disponibilidad (objetivo de 99.5% de tiempo en línea). No obstante, el servicio puede experimentar interrupciones programadas por mantenimiento preventivo (habitualmente en horarios inhábiles) o incidencias derivadas de proveedores de telecomunicaciones o causas de fuerza mayor.
          </p>
        </section>

        {/* Sección 7 */}
        <section id="suspension" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              7. Suspensión y Cancelación de Cuentas
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ISkool se reserva el derecho de suspender o revocar de manera inmediata el acceso a cualquier usuario que infrinja las presentes Condiciones del Servicio, vulnere la privacidad de menores o comprometa la seguridad de la infraestructura.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Asimismo, cualquier colegio o usuario titular puede dar de baja su cuenta en cualquier momento solicitando la exportación o eliminación de sus datos personales conforme a nuestra{' '}
            <Link href="/privacidad" className="text-indigo-600 font-bold underline">
              Política de Privacidad
            </Link>.
          </p>
        </section>

        {/* Sección 8 */}
        <section id="jurisdiccion" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Scale className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              8. Legislación Aplicable y Jurisdicción
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Para la interpretación, cumplimiento y ejecución de las presentes Condiciones del Servicio, las partes se someten expresamente a las leyes federales vigentes en los <strong>Estados Unidos Mexicanos</strong> y a la competencia de los tribunales de la <strong>Ciudad de México</strong>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
          </p>
        </section>

        {/* Sección 9 */}
        <section id="contacto" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Mail className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              9. Contacto y Consultas Legales
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Para aclaraciones sobre estas condiciones o asistencia con tu cuenta institucional, por favor contáctanos:
          </p>
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1.5">
            <p><strong>Departamento Legal:</strong> ISkool Tecnologías Educativas</p>
            <p><strong>Correo Electrónico Legal:</strong> <a href="mailto:legal@iskool.mx" className="text-indigo-600 font-bold underline">legal@iskool.mx</a></p>
            <p><strong>Atención y Soporte Escolar:</strong> <a href="mailto:soporte@iskool.mx" className="text-indigo-600 font-bold underline">soporte@iskool.mx</a></p>
            <p><strong>Sitio Web Oficial:</strong> <a href="https://iskool.mx" className="text-indigo-600 font-bold underline">https://iskool.mx</a></p>
          </div>
        </section>

      </main>

      {/* ========================================================= */}
      {/* 5. FOOTER INSTITUCIONAL PÚBLICO                           */}
      {/* ========================================================= */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300">
              © 2026 ISkool México. Todos los derechos reservados.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Plataforma de Gestión Escolar, Planeación NEM y Ecosistema Académico.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/privacidad" className="text-slate-600 dark:text-slate-400 hover:underline">
              Política de Privacidad
            </Link>
            <span>•</span>
            <Link href="/terminos" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Condiciones del Servicio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
