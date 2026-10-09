import { HermeticEmailBrainService } from '../src/lib/services/hermetic-email-brain.service';

const testCases = [
  {
    name: '1. Menu infantil (Caso reportado por el usuario)',
    subject: 'Menu infantil',
    body: 'Le solicito me diga el menú infantil de esta semana',
    expected: 'DELEGADO_CON_SLA'
  },
  {
    name: '2. Costo de comedor escolar',
    subject: 'Servicio de cafetería y costo',
    body: 'Buenos días, quisiera saber el costo mensual del servicio de comedor y qué opciones de alimentos tienen.',
    expected: 'DELEGADO_CON_SLA'
  },
  {
    name: '3. Taller extracurricular de robótica',
    subject: 'Inscripción a taller de robótica vespertino',
    body: 'Buenas tardes, quiero inscribir a mi hijo al taller de robótica de los martes.',
    expected: 'DELEGADO_CON_SLA'
  },
  {
    name: '4. Uniformes y credenciales',
    subject: 'Reposición de credencial y talla de suéter escolar',
    body: 'Hola, mi hijo perdió su credencial y necesito comprar una playera polo talla 10.',
    expected: 'DELEGADO_CON_SLA'
  },
  {
    name: '5. Dudas de clase y citas con maestros',
    subject: 'Solicitud de cita con maestra de inglés',
    body: 'Estimada maestra, solicito una cita breve para revisar el horario de clases y temario de examen.',
    expected: 'DELEGADO_CON_SLA'
  },
  {
    name: '6. Soporte de contraseña',
    subject: 'Recuperar contraseña del portal de padres',
    body: 'No puedo entrar a la plataforma de calificaciones, se me olvidó la contraseña institucional.',
    expected: 'DELEGADO_CON_SLA'
  },
  {
    name: '7. Intoxicación o malestar alimentario (Debe ir a CEO obligatorio)',
    subject: 'Urgente: Alumno con malestar estomacal e intoxicación por comida del comedor',
    body: 'Mi hijo regresó con vómito y fuerte dolor estomacal tras comer los alimentos proporcionados en el comedor.',
    expected: 'ATENCION_CEO'
  },
  {
    name: '8. Supervisión oficial SEP (Debe ir a CEO)',
    subject: 'Oficio de Supervisión Escolar Zona 14 SEP',
    body: 'Se requiere la presencia de Dirección General para la auditoría técnica curricular.',
    expected: 'ATENCION_CEO'
  },
  {
    name: '9. Spam y promociones externas',
    subject: 'Super ofertas en laptops y diseño web',
    body: 'Aproveche los cupones de descuento exclusivos de Amazon Prime y hosting.',
    expected: 'SPAM_DESCARTADO'
  },
  {
    name: '10. Confirmación informativa',
    subject: 'Confirmación de registro: Webinar Educativo Ciberlatam',
    body: 'Gracias por registrarte al webinar. Aquí está tu confirmación de acceso.',
    expected: 'INFORMATIVO'
  }
];

let allPassed = true;

for (const tc of testCases) {
  const result = HermeticEmailBrainService.classifyZeroTokenEmail(tc.subject, tc.body);
  const pass = result.quadrant === tc.expected;
  if (!pass) allPassed = false;
  console.log(`${pass ? '✅' : '❌'} ${tc.name}`);
  console.log(`   Esperado: ${tc.expected} | Obtenido: ${result.quadrant} (${result.badge.label})`);
  console.log(`   Categoría: ${result.category} | SLA: ${result.sla_hours || 'N/A'}h`);
}

if (!allPassed) {
  console.error('\n❌ ERROR: Algunas pruebas de triage operativo fallaron.');
  process.exit(1);
} else {
  console.log('\n🎉 TODAS LAS PRUEBAS DE TRIAGE OPERATIVO PASARON EXITOSAMENTE AL 100%.');
}
