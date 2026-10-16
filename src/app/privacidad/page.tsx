import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  EyeOff,
  Database,
  Trash2,
  ExternalLink,
  Mail,
  AlertCircle,
  Clock,
  Sparkles,
  School,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad | ISkool - Plataforma Educativa',
  description:
    'Política de Privacidad pública y oficial de la aplicación ISkool. Conoce el tratamiento de datos personales, autenticación segura con Google Sign-In y apego a la Google API Services User Data Policy.',
  alternates: {
    canonical: 'https://iskool.mx/privacidad'
  }
};

export default function PrivacyPolicyPage() {
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
            <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              Política de Privacidad
            </span>
            <Link
              href="/terminos"
              className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Condiciones del Servicio
            </Link>
          </nav>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO PRINCIPAL / DECLARACIÓN OFICIAL                   */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white py-12 sm:py-16 border-b border-indigo-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Documento Legal Oficial y Público</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Política de Privacidad de la Aplicación ISkool
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            En ISkool respetamos y protegemos la privacidad de nuestras comunidades educativas, estudiantes, docentes, tutores y directivos. Este documento describe de manera clara y transparente cómo recopilamos, usamos, protegemos y garantizamos el control de tu información al utilizar nuestra aplicación y servicios.
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
      {/* 3. CLÁUSULA CRÍTICA PARA REVISIÓN DE GOOGLE OAUTH         */}
      {/* ========================================================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-2 border-indigo-400/40 shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-black text-white">
                Declaración de Cumplimiento de la Política de Datos de Usuario de Google APIs
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                El uso y la transferencia que realiza <strong>ISkool</strong> a cualquier otra aplicación de la información recibida a través de las APIs de Google se apega estrictamente a la{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-indigo-300 hover:text-white font-bold inline-flex items-center gap-0.5"
                >
                  Política de Datos de Usuario de los Servicios de las APIs de Google (Google API Services User Data Policy)
                  <ExternalLink className="h-3 w-3 ml-0.5 inline" />
                </a>
                , incluidos los requisitos de <strong>Uso Limitado (Limited Use Requirements)</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px] font-bold">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Cero venta de datos a terceros</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Sin uso publicitario ni tracking comercial</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Revocación y supresión total inmediata</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. CONTENIDO COMPLETO Y EXHAUSTIVO DE PRIVACIDAD          */}
      {/* ========================================================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Sección 1 */}
        <section id="identidad" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <School className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              1. Identidad y Domicilio del Responsable
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>ISkool</strong> (en adelante denominada la &quot;Aplicación&quot; o &quot;ISkool&quot;), operando a través del dominio oficial <strong>https://iskool.mx</strong>, es una plataforma tecnológica especializada en servicios de gestión escolar, planeación curricular conforme a los planes y programas oficiales de la Secretaría de Educación Pública (NEM), seguimiento académico, comunicación institucional y aprendizaje gamificado para instituciones educativas, directores, profesores, alumnos y tutores.
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p><strong>Titular del Servicio:</strong> ISkool Tecnologías Educativas</p>
            <p><strong>Sitio Web Oficial:</strong> https://iskool.mx</p>
            <p><strong>Correo Oficial de Privacidad y Derechos ARCO:</strong> <a href="mailto:privacidad@iskool.mx" className="text-indigo-600 font-bold underline">privacidad@iskool.mx</a></p>
            <p><strong>Soporte Institucional:</strong> <a href="mailto:soporte@iskool.mx" className="text-indigo-600 font-bold underline">soporte@iskool.mx</a></p>
            <p><strong>Ubicación:</strong> Ciudad de México, México</p>
          </div>
        </section>

        {/* Sección 2 */}
        <section id="datos-recopilados" className="space-y-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Database className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              2. Datos Personales que Recopilamos y Alcances de Google (Scopes)
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ISkool recopila únicamente la información indispensable para habilitar el acceso a la plataforma escolar y prestar los servicios educativos contratados:
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
              <h3 className="font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2 text-sm sm:text-base">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                A. Alcances solicitados mediante Google Sign-In / OAuth (Google Scopes):
              </h3>
              <p className="text-xs leading-relaxed">
                Cuando inicias sesión con tu cuenta de Google, ISkool solicita de manera explícita y transparente los siguientes permisos mínimos necesarios:
              </p>

              {/* Tabla de Scopes Oficial de Google */}
              <div className="overflow-x-auto rounded-xl border border-indigo-200/70 dark:border-indigo-800/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-950 dark:text-indigo-200 font-bold border-b border-indigo-200 dark:border-indigo-800">
                    <tr>
                      <th className="p-2.5">Scope de Google API</th>
                      <th className="p-2.5">Dato Obtenido</th>
                      <th className="p-2.5">Finalidad Pedagógica Específica</th>
                      <th className="p-2.5">Almacenamiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100 dark:divide-indigo-950/50">
                    <tr className="hover:bg-white/50 dark:hover:bg-indigo-950/20">
                      <td className="p-2.5 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">openid</td>
                      <td className="p-2.5">Identificador de cuenta Google</td>
                      <td className="p-2.5">Autenticación segura sin almacenar contraseñas</td>
                      <td className="p-2.5 font-mono text-[10px]">Cifrado AES-256</td>
                    </tr>
                    <tr className="hover:bg-white/50 dark:hover:bg-indigo-950/20">
                      <td className="p-2.5 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">.../auth/userinfo.email</td>
                      <td className="p-2.5">Dirección de correo electrónico</td>
                      <td className="p-2.5">Verificación de pertenencia al colegio y notificaciones institucionales</td>
                      <td className="p-2.5 font-mono text-[10px]">Cifrado en reposo</td>
                    </tr>
                    <tr className="hover:bg-white/50 dark:hover:bg-indigo-950/20">
                      <td className="p-2.5 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">.../auth/userinfo.profile</td>
                      <td className="p-2.5">Nombre completo y foto de perfil</td>
                      <td className="p-2.5">Despliegue del perfil en listas de clase, expedientes y diplomas escolares</td>
                      <td className="p-2.5 font-mono text-[10px]">Cifrado en reposo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-black text-slate-900 dark:text-slate-100">
                B. Datos Académicos e Institucionales provistos por el Colegio:
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                <li>Rol educativo: Director, Coordinador, Docente titular, Alumno o Tutor legal.</li>
                <li>Grado escolar, grupo, asignaturas y registros de asistencia o calificaciones.</li>
                <li>Evidencias pedagógicas, entregables escolares y rúbricas analíticas generadas en clase.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección 3 */}
        <section id="finalidades" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              3. Finalidades del Tratamiento de los Datos
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Toda la información recabada se destina de forma exclusiva a finalidades educativas legítimas:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Autenticación Segura (SSO):</strong>
              Validar de forma inmediata el acceso de directivos, profesores, alumnos y tutores mediante credenciales autorizadas.
            </li>
            <li className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Gestión Curricular y Calificaciones:</strong>
              Permitir a los docentes registrar planeaciones, tareas, evaluaciones formativas y seguimiento según la NEM 2024.
            </li>
            <li className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Comunicación Escolar Asertiva:</strong>
              Facilitar el envío de circulares, avisos de transporte, emergencias y avances académicos a las familias.
            </li>
            <li className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <strong className="block text-slate-900 dark:text-white mb-0.5">Seguridad y Prevención de Fraude:</strong>
              Monitorear accesos sospechosos y garantizar la estricta separación de datos entre colegios (aislamiento multi-tenant).
            </li>
          </ul>
        </section>

        {/* Sección 4 */}
        <section id="limited-use" className="space-y-4 p-6 sm:p-8 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-black text-indigo-950 dark:text-white">
              4. Política de Uso Limitado de Google (Google Limited Use Disclosure)
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed space-y-4">
            <p className="font-semibold">
              ISkool declara expresamente su estricto apego y cumplimiento a las directrices de la Política de Datos de Usuario de los Servicios de API de Google:
            </p>

            {/* Declaración Oficial en Español */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Declaración Obligatoria de Cumplimiento (Español)
              </span>
              <p className="font-mono text-xs text-indigo-950 dark:text-indigo-100 font-bold leading-relaxed">
                &quot;El uso y la transferencia que hace ISkool a cualquier otra aplicación de la información recibida a través de las APIs de Google se apegará a la Google API Services User Data Policy, incluidos los requisitos de Uso Limitado (Limited Use Requirements).&quot;
              </p>
            </div>

            {/* Declaración Oficial en Inglés para el Equipo de Verificación de Google */}
            <div className="p-4 rounded-2xl bg-blue-950 text-blue-100 border border-blue-500/40 space-y-1.5 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                Official Compliance Statement (English - Mandatory for Google OAuth Verification Reviewers)
              </span>
              <p className="font-mono text-xs text-white font-bold leading-relaxed">
                &quot;ISkool&apos;s use and transfer of information received from Google APIs to any other app will adhere to the{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sky-300 hover:text-white"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.&quot;
              </p>
            </div>

            <p className="font-semibold text-slate-800 dark:text-slate-200">En concordancia con estos principios y las directrices de Google:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li><strong>Finalidad Limitada:</strong> Solo utilizamos los datos recibidos a través de las APIs de Google para proporcionar y mejorar las características pedagógicas visibles para el usuario en la interfaz académica de ISkool.</li>
              <li><strong>Prohibición de Venta y Transferencia:</strong> ISkool jamás vende, alquila ni transfiere datos de usuarios de Google a terceros, anunciantes, intermediarios de datos ni redes de marketing.</li>
              <li><strong>Prohibición Publicitaria:</strong> En ningún caso utilizamos los datos de usuarios de Google para mostrar anuncios publicitarios, crear perfiles comerciales con fines de lucro ni realizar seguimiento fuera de la plataforma escolar.</li>
              <li><strong>Prohibición de Entrenamiento No Autorizado de IA:</strong> Los datos de usuario de Google no se emplean para entrenar ni mejorar modelos generalistas de inteligencia artificial o aprendizaje automático.</li>
              <li><strong>Acceso Humano Restringido:</strong> Ningún empleado o desarrollador de ISkool accede manualmente a los datos de usuario de Google, a menos que el usuario lo autorice explícitamente para resolver una incidencia técnica o sea estrictamente requerido por ley.</li>
            </ul>
          </div>
        </section>

        {/* Sección 5 */}
        <section id="seguridad" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Lock className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              5. Almacenamiento, Retención y Medidas de Seguridad
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ISkool implementa controles técnicos, administrativos y físicos de grado institucional para proteger la información contra pérdida, robo, alteración o acceso no autorizado:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="block text-slate-900 dark:text-white">Cifrado de Extremo a Extremo</strong>
              <p className="text-slate-500 dark:text-slate-400">Transmisión protegida mediante TLS 1.3 y cifrado en reposo AES-256 en servidores certificados.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="block text-slate-900 dark:text-white">Aislamiento Multi-Tenant</strong>
              <p className="text-slate-500 dark:text-slate-400">Bóvedas curriculares herméticas: los datos de una escuela nunca se mezclan ni son visibles para otra.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="block text-slate-900 dark:text-white">Tokens y Sesiones Seguras</strong>
              <p className="text-slate-500 dark:text-slate-400">Cookies HttpOnly criptográficas sin exponer contraseñas ni tokens en el almacenamiento local.</p>
            </div>
          </div>
        </section>

        {/* Sección 6 */}
        <section id="eliminacion" className="space-y-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Trash2 className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              6. Revocación de Permisos de Google y Eliminación Total de Datos (Derecho al Olvido)
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Los usuarios conservan en todo momento el control pleno sobre sus datos personales y credenciales de Google:
          </p>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>A. ¿Cómo revocar el acceso de ISkool a tu cuenta de Google?</span>
              </h3>
              <p className="text-xs">
                Puedes desvincular o revocar los permisos otorgados a ISkool en cualquier instante visitando la página de seguridad de tu cuenta de Google:
              </p>
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                <span>Administrar aplicaciones con acceso a tu cuenta de Google</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                B. ¿Cómo solicitar la eliminación definitiva de tu cuenta y datos (Derechos ARCO)?
              </h3>
              <p className="text-xs">
                Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO), o solicitar la eliminación total de tus registros enviando un correo electrónico a:
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs">
                <Mail className="h-4 w-4 text-indigo-600" />
                <span className="font-bold text-indigo-700 dark:text-indigo-300">privacidad@iskool.mx</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tu solicitud será atendida y confirmada en un plazo máximo de <strong>48 a 72 horas hábiles</strong>, eliminando los identificadores de cuenta y registros asociados de nuestras bases de datos activas.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 7 */}
        <section id="menores" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              7. Protección de Menores de Edad
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Dado que ISkool es utilizado en colegios de educación básica y media, la información de estudiantes menores de edad es tratada con rigor reforzado. Las cuentas de alumnos son creadas y gestionadas bajo la supervisión directa de la institución educativa contratante y con el consentimiento de sus tutores legales. Queda estrictamente prohibida la recopilación de datos de menores con propósitos ajenos a la actividad escolar y curricular.
          </p>
        </section>

        {/* Sección 8 */}
        <section id="contacto" className="space-y-3 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
            <Mail className="h-5 w-5" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              8. Contacto Oficial de Privacidad
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Para dudas, consultas o aclaraciones respecto a esta Política de Privacidad o el tratamiento de tus datos, puedes comunicarte con nuestro Oficial de Privacidad y Seguridad Escolar:
          </p>
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1.5">
            <p><strong>Departamento de Privacidad y Cumplimiento:</strong> ISkool Legal</p>
            <p><strong>Correo Electrónico Directo:</strong> <a href="mailto:privacidad@iskool.mx" className="text-indigo-600 font-bold underline">privacidad@iskool.mx</a></p>
            <p><strong>Portal Web Público:</strong> <a href="https://iskool.mx" className="text-indigo-600 font-bold underline">https://iskool.mx</a></p>
            <p><strong>Condiciones del Servicio:</strong> <Link href="/terminos" className="text-indigo-600 font-bold underline">https://iskool.mx/terminos</Link></p>
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
            <Link href="/privacidad" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Política de Privacidad
            </Link>
            <span>•</span>
            <Link href="/terminos" className="text-slate-600 dark:text-slate-400 hover:underline">
              Condiciones del Servicio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
