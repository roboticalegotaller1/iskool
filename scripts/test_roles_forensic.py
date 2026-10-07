import urllib.request
import json
import http.cookiejar

BASE_URL = 'http://localhost:3000'

ROLES_CONFIG = [
    {
        'name': 'ALUMNO (Student)',
        'user': {
            'id': 'usr-student-01',
            'email': 'alumno.demo@iskool.edu.mx',
            'role': 'student',
            'first_name': 'Diego',
            'last_name': 'Navarro'
        },
        'routes': [
            '/student',
            '/student/avatar',
            '/student/portfolio',
            '/student/shop',
            '/student/idiomas',
            '/student/idiomas/studio/writing'
        ]
    },
    {
        'name': 'PADRE DE FAMILIA (Parent/Tutor)',
        'user': {
            'id': 'usr-parent-01',
            'email': 'tutor.mendoza@iskool.edu.mx',
            'role': 'parent',
            'first_name': 'Roberto',
            'last_name': 'Mendoza'
        },
        'routes': [
            '/parent',
            '/parent/financial'
        ]
    },
    {
        'name': 'PROFESOR (Teacher)',
        'user': {
            'id': 'usr-teacher-01',
            'email': 'profesora.patricia@iskool.edu.mx',
            'role': 'teacher',
            'first_name': 'Patricia',
            'last_name': 'Morales'
        },
        'routes': [
            '/teacher',
            '/teacher/studio',
            '/teacher/grades',
            '/teacher/community',
            '/teacher/idiomas',
            '/teacher/idiomas/writing',
            '/planeaciones'
        ]
    },
    {
        'name': 'ADMINISTRATIVO / COORDINADOR (Admin)',
        'user': {
            'id': 'usr-admin-01',
            'email': 'admin.escolar@iskool.edu.mx',
            'role': 'admin',
            'first_name': 'Coordinación',
            'last_name': 'General'
        },
        'routes': [
            '/admin',
            '/admin/crm',
            '/admin/intelligence',
            '/admin/whitelabel',
            '/coordinator',
            '/coordinator/billing',
            '/coordinator/fiscal',
            '/coordinator/institutional-memory'
        ]
    },
    {
        'name': 'DIRECTOR / CEO (Executive)',
        'user': {
            'id': 'usr-ceo-01',
            'email': 'direccion.general@iskool.edu.mx',
            'role': 'director',
            'first_name': 'Angélica',
            'last_name': 'Reyes'
        },
        'routes': [
            '/director',
            '/admin/ceo',
            '/portal-ceo/email',
            '/portal-ceo/laboratorio-pedagogico'
        ]
    }
]

def run_role_audit():
    print("=" * 70)
    print("AUDITORÍA FORENSE MULTI-ROL (5 PERFILES)")
    print("=" * 70)

    total_checked = 0
    passed = 0
    failed = 0

    for role_data in ROLES_CONFIG:
        print(f"\n[PERFIL]: {role_data['name']}")
        print("-" * 50)
        
        # 1. Crear sesión autenticada con Cookie Jar
        cj = http.cookiejar.CookieJar()
        opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
        
        auth_payload = json.dumps({'user': role_data['user']}).encode('utf-8')
        req = urllib.request.Request(
            f"{BASE_URL}/api/auth/session",
            data=auth_payload,
            headers={'Content-Type': 'application/json'}
        )
        
        try:
            res = opener.open(req)
            session_info = json.loads(res.read().decode('utf-8'))
            if not session_info.get('success'):
                print(f"  [ERR] Error inicializando sesion para {role_data['name']}")
                continue
            print(f"  [OK] Sesion criptografica establecida (Rol: {session_info['user']['role']})")
        except Exception as e:
            print(f"  [ERR] Excepcion al autenticar sesion: {e}")
            continue

        # 2. Auditar cada ruta asignada al rol
        for route in role_data['routes']:
            total_checked += 1
            url = f"{BASE_URL}{route}"
            req = urllib.request.Request(url)
            try:
                page_res = opener.open(req)
                code = page_res.getcode()
                content = page_res.read().decode('utf-8', errors='ignore')
                # Verificar que no devuelva página de error 500 oculta en HTML
                if code == 200 and 'Unhandled Runtime Error' not in content and 'Internal Server Error' not in content:
                    print(f"  [PASS] {code} -> {route}")
                    passed += 1
                else:
                    print(f"  [FAIL] {code} -> {route} (Contenido con error potencial)")
                    failed += 1
            except urllib.error.HTTPError as he:
                print(f"  [FAIL] {he.code} -> {route} ({he.reason})")
                failed += 1
            except Exception as ex:
                print(f"  [FAIL] ERR -> {route} ({ex})")
                failed += 1

    print("\n" + "=" * 70)
    print(f"RESUMEN FORENSE DE ROLES: Total: {total_checked} | Éxito: {passed} | Fallos: {failed}")
    print("=" * 70)

if __name__ == '__main__':
    run_role_audit()
