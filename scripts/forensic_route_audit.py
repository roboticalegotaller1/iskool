import urllib.request
import urllib.error
import time
import json

routes_to_test = [
    # Public & Promo
    ("/", "Landing / Public"),
    ("/promo", "Promo / Demostración"),
    ("/login", "Login Portal"),
    ("/guide", "Guía del Sistema"),
    
    # Student Portal (Alumno)
    ("/student", "Alumno - Dashboard"),
    ("/student/avatar", "Alumno - Avatar"),
    ("/student/portfolio", "Alumno - Portafolio"),
    ("/student/shop", "Alumno - Tienda / Recompensas"),
    ("/student/idiomas", "Alumno - Portal de Idiomas"),
    ("/student/idiomas/studio/writing", "Alumno - Redacción Idiomas"),
    
    # Parent / Tutor Portal (Padre de Familia)
    ("/parent", "Tutor - Dashboard General"),
    ("/parent/financial", "Tutor - Estado de Cuenta Financiero"),
    
    # Teacher Portal (Profesor)
    ("/teacher", "Docente - Dashboard"),
    ("/teacher/studio", "Docente - Estudio de Actividades"),
    ("/teacher/grades", "Docente - Calificaciones"),
    ("/teacher/community", "Docente - Comunidad"),
    ("/teacher/idiomas", "Docente - Idiomas"),
    ("/teacher/idiomas/writing", "Docente - Taller de Escritura"),
    ("/planeaciones", "Docente - Bóveda Curricular"),
    
    # Administrative & Coordinator (Administrativo)
    ("/admin", "Admin - Dashboard Control Escolar"),
    ("/admin/crm", "Admin - CRM Admisiones"),
    ("/admin/intelligence", "Admin - Inteligencia Institucional"),
    ("/admin/whitelabel", "Admin - Personalización Institucional"),
    ("/coordinator", "Coordinador - Panel"),
    ("/coordinator/billing", "Coordinador - Facturación"),
    ("/coordinator/fiscal", "Coordinador - Módulo Fiscal SAT"),
    ("/coordinator/institutional-memory", "Coordinador - Memoria Institucional"),
    ("/director", "Director - Tablero Directivo 360"),
    ("/crm", "CRM - Admisiones Directas"),
    
    # CEO & Super User (Super Usuario)
    ("/admin/ceo", "CEO - Consola Ejecutiva"),
    ("/portal-ceo/email", "CEO - Consola de Correo Inteligente"),
    ("/portal-ceo/laboratorio-pedagogico", "CEO - Laboratorio Pedagógico"),
    
    # White-Label Sub-Portal (ej. IBIME)
    ("/ibime", "IBIME - Inicio"),
    ("/ibime/login", "IBIME - Acceso"),
    ("/ibime/portal", "IBIME - Portal Institucional"),
    
    # APIs Clave
    ("/api/iskool/health", "API - Salud del Sistema"),
    ("/api/vault/historical-figures?list=true", "API - Lista Bóveda Curricular"),
    ("/api/inbox/matters", "API - Asuntos de Correo"),
    ("/api/iskool/analytics", "API - Analíticas"),
    ("/api/fiscal/status", "API - Estado Fiscal SAT"),
]

results = []
print(f"Iniciando Auditoría Forense de Rutas HTTP ({len(routes_to_test)} endpoints)...")

for path, desc in routes_to_test:
    url = f"http://localhost:3000{path}"
    start = time.time()
    try:
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "ISkool-Forensic-Audit/1.0", "Accept": "text/html,application/json"}
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            elapsed_ms = int((time.time() - start) * 1000)
            code = resp.getcode()
            body_peek = resp.read(2048).decode("utf-8", errors="ignore")
            has_error_text = "Internal Server Error" in body_peek or "Unhandled Runtime Error" in body_peek
            status = "FAIL (Error en cuerpo)" if has_error_text else "PASS"
            results.append({
                "path": path,
                "desc": desc,
                "code": code,
                "time_ms": elapsed_ms,
                "status": status,
                "error": None
            })
            print(f"[{status}] {code} ({elapsed_ms}ms) -> {path} ({desc})")
    except urllib.error.HTTPError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        # 307 or 401 might be expected for protected routes if not logged in
        status = "WARN" if e.code in [307, 308, 401] else "FAIL"
        results.append({
            "path": path,
            "desc": desc,
            "code": e.code,
            "time_ms": elapsed_ms,
            "status": status,
            "error": str(e)
        })
        print(f"[{status}] {e.code} ({elapsed_ms}ms) -> {path} ({desc}) [{e.reason}]")
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        results.append({
            "path": path,
            "desc": desc,
            "code": 0,
            "time_ms": elapsed_ms,
            "status": "FAIL",
            "error": str(e)
        })
        print(f"[FAIL] 0 ({elapsed_ms}ms) -> {path} ({desc}) [EXCEPTION: {e}]")

# Resumen
passed = [r for r in results if r["status"] == "PASS"]
warns = [r for r in results if r["status"] == "WARN"]
failed = [r for r in results if r["status"].startswith("FAIL")]

print(f"\n=======================================================")
print(f"TOTAL AUDITADOS: {len(results)}")
print(f"EXITOSOS (PASS): {len(passed)}")
print(f"ADVERTENCIAS / REDIRECTS (WARN): {len(warns)}")
print(f"FALLIDOS (FAIL): {len(failed)}")
print(f"=======================================================")

if failed:
    print("\nDETALLE DE FALLIDOS:")
    for f in failed:
        print(f"  {f['path']} - {f['code']} - {f['error']}")

with open("forensic_audit_results.json", "w", encoding="utf-8") as out:
    json.dump(results, out, indent=2, ensure_ascii=False)
