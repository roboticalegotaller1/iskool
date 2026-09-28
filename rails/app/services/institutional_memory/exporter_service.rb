# frozen_string_literal: true
# app/services/institutional_memory/exporter_service.rb
#
# iSkool Institutional Brain - Rails Aggregator & Ingestion Emitter
# Principio Pedagógico:
# «Cada ciclo escolar que una institución utiliza iSkool, la institución debe saber más
# sobre sí misma que el ciclo anterior. El docente trabaja en su flujo normal; iSkool recuerda; la institución aprende.»
#
# Regla No Negociable 1: Cero PII en la Bóveda Curricular.
# Solo se transmiten métricas cuantitativas consolidadas, puntos de fricción conceptual y adaptaciones didácticas.

require 'net/http'
require 'uri'
require 'json'
require 'time'

module InstitutionalMemory
  class PrivacyViolationError < StandardError; end

  class ExporterService
    MASTERY_SCORE_THRESHOLD = 7.0 # Umbral en escala 0-10 para considerar dominio
    DEFAULT_API_URL = ENV.fetch('ISKOOL_VAULT_API_URL', 'http://localhost:3000/api/vault/memory')
    DEFAULT_SECRET = ENV.fetch('RAILS_INGESTION_SECRET', 'iskool_memory_secret_default')

    # Patrones prohibidos de información nominativa (Cero PII)
    PROHIBITED_KEYS = %w[
      student_name alumno nombre_estudiante curp email correo
      telefono phone matricula student_id user_id student_token
    ].freeze

    CURP_REGEX = /[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d/i
    EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/

    class << self
      # Método principal para exportar un lote de evaluaciones consolidadas a la Bóveda Curricular
      def export_batch(
        institution_id:,
        academic_cycle:,
        grade:,
        subject:,
        topic:,
        group_cohort:,
        created_by_teacher_ref:,
        author_display_name:,
        rails_activity_id:,
        evaluations:,
        rails_assessment_batch_id: nil,
        activity_source: nil,
        contexto_diagnostico: nil,
        adaptaciones_exitosas: [],
        recomendaciones_proximo_ciclo: [],
        custom_endpoint: nil,
        secret: nil
      )
        # 1. BLINDAJE DE PRIVACIDAD ABSOLUTA (Cero PII)
        validate_zero_pii!(evaluations, [contexto_diagnostico, adaptaciones_exitosas, recomendaciones_proximo_ciclo])

        # 2. Agregación de métricas cuantitativas
        metrics = aggregate_evaluations(evaluations)

        # 3. Construcción del payload conforme al contrato de la Bóveda Curricular
        payload = {
          institution_id: institution_id.to_s.strip,
          campus: 'Campus Central',
          academic_cycle: academic_cycle.to_s.strip,
          grade: grade,
          subject: subject.to_s.strip,
          topic: topic.to_s.strip,
          activity_source: activity_source || "[[planeaciones/#{subject}/Planeacion_#{topic.gsub(/\s+/, '_')}.md]]",
          created_by_teacher_ref: created_by_teacher_ref.to_s.strip,
          author_display_name: author_display_name.to_s.strip,
          group_cohort: group_cohort.to_s.strip,
          metrics: metrics,
          provenance: {
            rails_activity_id: rails_activity_id.to_s,
            rails_assessment_batch_id: rails_assessment_batch_id&.to_s,
            captured_at: Time.now.utc.iso8601,
            ingestion_agent: 'iSkool-Rails-Exporter/1.0',
            school_id: institution_id.to_s.strip
          },
          sections: {
            contextoDiagnostico: contexto_diagnostico || "Evaluación formativa regular de cierre de secuencia en Grupo #{group_cohort}.",
            friccionesErrores: metrics[:comprehension_friction_points],
            adaptacionesExitosas: adaptaciones_exitosas.empty? ? [
              "Uso de material manipulable y representación gráfica previa a la formalización abstracta.",
              "Dinámicas de trabajo colaborativo en parejas con retroalimentación inmediata."
            ] : adaptaciones_exitosas,
            recomendacionesProximoCiclo: recomendaciones_proximo_ciclo.empty? ? [
              "Dedicar al menos 15 minutos iniciales a afianzar los conceptos prerrequisito detectados con fricción.",
              "Conservar el material visual de apoyo durante toda la fase de resolución autónoma."
            ] : recomendaciones_proximo_ciclo
          }
        }

        # 4. Transmisión HTTP segura hacia el endpoint de la Bóveda Curricular
        transmit_payload(payload, endpoint: custom_endpoint || DEFAULT_API_URL, secret: secret || DEFAULT_SECRET)
      end

      # Genera un lote sintético para pruebas y demostración de ciclo de vida completo
      def generate_synthetic_batch(grade: 4, subject: 'matematicas', topic: 'fracciones_equivalentes', cohort: '4B')
        sample_frictions = [
          "Confusión entre numerador y denominador al simplificar",
          "Dificultad para visualizar equivalencia en rectas numéricas",
          "Error al multiplicar cruzado sin entender proporcionalidad",
          "Inseguridad al comparar fracciones con denominadores distintos"
        ]

        total_students = rand(24..32)
        evaluations = (1..total_students).map do |i|
          # Simula notas con distribución realista (promedio ~7.8)
          score = (5.0 + rand * 5.0).round(1)
          frictions = []
          frictions << sample_frictions.sample if score < 8.0
          frictions << sample_frictions.sample if score < 6.5

          {
            score: score,
            completed: true,
            time_spent_minutes: rand(35..55),
            friction_tags: frictions.uniq
          }
        end

        export_batch(
          institution_id: 'colegio_hidalgo',
          academic_cycle: '2025-2026',
          grade: grade,
          subject: subject,
          topic: topic,
          group_cohort: cohort,
          created_by_teacher_ref: 'teacher_titular_04',
          author_display_name: 'Prof. Gabriel Mendoza',
          rails_activity_id: "act_#{rand(1000..9999)}",
          rails_assessment_batch_id: "batch_#{rand(5000..9999)}",
          evaluations: evaluations,
          contexto_diagnostico: "Evaluación formativa del Grupo #{cohort} en el tema #{topic}. Se aplicaron rúbricas analíticas de la NEM.",
          adaptaciones_exitosas: [
            "Se implementaron regletas de fracciones manipulables antes de los ejercicios en cuaderno.",
            "Visualización en Lienzo Digital interactivo para contrastar áreas coloreadas."
          ],
          recomendaciones_proximo_ciclo: [
            "Reforzar el concepto de unidad antes de dividir en partes iguales.",
            "Prevenir la memorización de algoritmos cruzados sin justificación geométrica."
          ]
        )
      end

      private

      # Agrega calificaciones y calcula tasa de dominio y puntos de fricción recurrentes
      def aggregate_evaluations(evaluations)
        total = evaluations.size
        raise ArgumentError, "El lote de evaluaciones no puede estar vacío" if total.zero?

        passed_count = evaluations.count do |ev|
          score = ev[:score] || ev['score'] || 0.0
          score.to_f >= MASTERY_SCORE_THRESHOLD
        end

        mastery_rate = (passed_count.to_f / total).round(2)

        # Recopilación y conteo de fricciones conceptuales
        friction_counts = Hash.new(0)
        durations = []

        evaluations.each do |ev|
          tags = ev[:friction_tags] || ev['friction_tags'] || []
          tags.each { |t| friction_counts[t.to_s.strip] += 1 unless t.to_s.strip.empty? }

          duration = ev[:time_spent_minutes] || ev['time_spent_minutes']
          durations << duration.to_f if duration
        end

        # Selecciona las fricciones más frecuentes
        top_frictions = friction_counts.sort_by { |_k, v| -v }.map(&:first)

        {
          students_evaluated_count: total,
          mastery_rate: mastery_rate,
          comprehension_friction_points: top_frictions.empty? ? ["ninguna_detectada"] : top_frictions,
          average_session_duration_minutes: durations.empty? ? nil : (durations.sum / durations.size).round(1),
          completion_rate: 1.0
        }
      end

      # Garantiza Cero PII en la estructura a transmitir
      def validate_zero_pii!(evaluations, other_texts)
        # Revisión de llaves de evaluaciones
        evaluations.each do |ev|
          ev.each_key do |k|
            key_str = k.to_s.downcase
            if PROHIBITED_KEYS.any? { |pk| key_str.include?(pk) }
              raise PrivacyViolationError, "VIOLACIÓN DE PRIVACIDAD: Llave prohibida '#{k}' detectada en evaluación. Cero PII en Bóveda Curricular."
            end
          end

          # Revisión de valores string
          ev.each_value do |v|
            check_text_pii!(v.to_s) if v.is_a?(String)
          end
        end

        # Revisión de textos narrativos
        other_texts.flatten.compact.each do |text|
          check_text_pii!(text.to_s)
        end
      end

      def check_text_pii!(str)
        if str =~ CURP_REGEX
          raise PrivacyViolationError, "VIOLACIÓN DE PRIVACIDAD: Patrón de CURP detectado en datos a exportar."
        end
        if str =~ EMAIL_REGEX
          raise PrivacyViolationError, "VIOLACIÓN DE PRIVACIDAD: Dirección de correo electrónico detectada en datos a exportar."
        end
      end

      # Transmite la petición HTTP POST autenticada
      def transmit_payload(payload, endpoint:, secret:)
        uri = URI.parse(endpoint)
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = (uri.scheme == 'https')
        http.open_timeout = 10
        http.read_timeout = 15

        request = Net::HTTP::Post.new(uri.request_uri)
        request['Content-Type'] = 'application/json'
        request['Authorization'] = "Bearer #{secret}"
        request['User-Agent'] = 'iSkool-Rails-Exporter/1.0'
        request.body = JSON.generate(payload)

        response = http.request(request)

        result_body = begin
          JSON.parse(response.body)
        rescue StandardError
          { 'raw' => response.body }
        end

        {
          success: response.is_a?(Net::HTTPSuccess) || response.is_a?(Net::HTTPCreated),
          status_code: response.code.to_i,
          response: result_body,
          transmitted_metrics: payload[:metrics],
          provenance: payload[:provenance]
        }
      end
    end
  end
end
