"""
Alethia — Seed de datos simulados
Genera datos realistas del Congreso Argentino para validar el modelo
Ejecutar: python -m seeds.seed_demo
"""
import asyncio
import random
import uuid
from datetime import date, timedelta, datetime
from faker import Faker

fake = Faker("es_AR")

# ─── Datos fijos realistas ────────────────────────────────────

INSTITUTIONS = [
    {"name": "Cámara de Diputados de la Nación", "short_name": "HCD", "type": "deputies"},
    {"name": "Senado de la Nación Argentina",    "short_name": "HCS", "type": "senate"},
    {"name": "Poder Ejecutivo Nacional",          "short_name": "PEN", "type": "executive"},
    {"name": "Legislatura de la Ciudad de Buenos Aires", "short_name": "LCBA", "type": "municipal"},
]

PARTIES = [
    {"name": "Unión por la Patria",          "short_name": "UxP",  "color_hex": "#1A5FA8", "ideology": "center-left"},
    {"name": "La Libertad Avanza",            "short_name": "LLA",  "color_hex": "#9B59B6", "ideology": "libertarian-right"},
    {"name": "Juntos por el Cambio",          "short_name": "JxC",  "color_hex": "#F4D03F", "ideology": "center-right"},
    {"name": "Hacemos Coalición Federal",     "short_name": "HCF",  "color_hex": "#E67E22", "ideology": "center"},
    {"name": "Frente de Izquierda",           "short_name": "FIT",  "color_hex": "#E74C3C", "ideology": "far-left"},
]

TOPICS = [
    {"name": "Economía y Finanzas",  "slug": "economia",      "policy_area": "economy",     "color_hex": "#2ECC71", "gap_score": 45.0,  "gap_label": "45x"},
    {"name": "Seguridad",            "slug": "seguridad",     "policy_area": "security",    "color_hex": "#E74C3C", "gap_score": 32.0,  "gap_label": "32x"},
    {"name": "Educación",            "slug": "educacion",     "policy_area": "education",   "color_hex": "#F39C12", "gap_score": 37.0,  "gap_label": "37x"},
    {"name": "Salud",                "slug": "salud",         "policy_area": "health",      "color_hex": "#3498DB", "gap_score": 28.0,  "gap_label": "28x"},
    {"name": "Minería y Recursos",   "slug": "mineria",       "policy_area": "industry",    "color_hex": "#95A5A6", "gap_score": 542.0, "gap_label": "542x"},
    {"name": "Agro e Industria",     "slug": "agro",          "policy_area": "agriculture", "color_hex": "#27AE60", "gap_score": 111.0, "gap_label": "111x"},
    {"name": "Medio Ambiente",       "slug": "medio-ambiente","policy_area": "environment", "color_hex": "#1ABC9C", "gap_score": 89.0,  "gap_label": "89x"},
    {"name": "Infraestructura",      "slug": "infraestructura","policy_area": "infrastructure","color_hex": "#8E44AD", "gap_score": 67.0, "gap_label": "67x"},
    {"name": "Derechos Humanos",     "slug": "ddhh",          "policy_area": "rights",      "color_hex": "#E91E63", "gap_score": 15.0,  "gap_label": "15x"},
    {"name": "Relaciones Exteriores","slug": "exterior",      "policy_area": "foreign",     "color_hex": "#607D8B", "gap_score": 22.0,  "gap_label": "22x"},
]

POLITICIANS_DATA = [
    {"full_name": "Alejandro Vargas",     "province": "Buenos Aires",  "gender": "M", "photo": "https://i.pravatar.cc/150?img=1"},
    {"full_name": "María Fernández",      "province": "Córdoba",       "gender": "F", "photo": "https://i.pravatar.cc/150?img=5"},
    {"full_name": "Carlos López",         "province": "Santa Fe",      "gender": "M", "photo": "https://i.pravatar.cc/150?img=3"},
    {"full_name": "Elena Soler",          "province": "Mendoza",       "gender": "F", "photo": "https://i.pravatar.cc/150?img=9"},
    {"full_name": "Roberto Acosta",       "province": "Tucumán",       "gender": "M", "photo": "https://i.pravatar.cc/150?img=7"},
    {"full_name": "Lucía Martínez",       "province": "Entre Ríos",    "gender": "F", "photo": "https://i.pravatar.cc/150?img=11"},
    {"full_name": "Diego Herrera",        "province": "Salta",         "gender": "M", "photo": "https://i.pravatar.cc/150?img=13"},
    {"full_name": "Camila Torres",        "province": "Chaco",         "gender": "F", "photo": "https://i.pravatar.cc/150?img=15"},
    {"full_name": "Hernán Gómez",         "province": "Neuquén",       "gender": "M", "photo": "https://i.pravatar.cc/150?img=17"},
    {"full_name": "Ana Ramos",            "province": "Río Negro",     "gender": "F", "photo": "https://i.pravatar.cc/150?img=19"},
    {"full_name": "Pablo Moreno",         "province": "Jujuy",         "gender": "M", "photo": "https://i.pravatar.cc/150?img=21"},
    {"full_name": "Valeria Suárez",       "province": "Misiones",      "gender": "F", "photo": "https://i.pravatar.cc/150?img=23"},
    {"full_name": "Gustavo Pérez",        "province": "Corrientes",    "gender": "M", "photo": "https://i.pravatar.cc/150?img=25"},
    {"full_name": "Natalia Rojas",        "province": "La Pampa",      "gender": "F", "photo": "https://i.pravatar.cc/150?img=27"},
    {"full_name": "Sebastián Castro",     "province": "San Luis",      "gender": "M", "photo": "https://i.pravatar.cc/150?img=29"},
]

SPEECH_TEMPLATES = {
    "economy": [
        "La situación económica del país requiere medidas urgentes. La inflación afecta directamente a las familias de clase media trabajadora. Propongo {action} para estabilizar el tipo de cambio y reducir el déficit fiscal.",
        "El modelo económico actual es insostenible. No podemos seguir con un Estado que {problem}. Debemos implementar reformas estructurales que permitan el crecimiento genuino.",
        "Me opongo firmemente a esta medida que afecta a los sectores más vulnerables. El ajuste no puede recaer sobre los jubilados y los trabajadores. Necesitamos {alternative}.",
        "El acuerdo con el FMI representa una oportunidad para ordenar las cuentas públicas, pero debe acompañarse de protecciones sociales. Apoyo el proyecto con las modificaciones propuestas.",
    ],
    "education": [
        "La educación pública es la columna vertebral de nuestra democracia. El recorte presupuestario en universidades nacionales es un ataque directo a la movilidad social.",
        "Necesitamos modernizar el sistema educativo argentino. La brecha digital es real y afecta principalmente a los estudiantes del interior del país.",
        "Los docentes merecen un salario digno. Hemos presentado {bill_count} proyectos para actualizar el Fondo de Incentivo Docente y nunca fueron tratados en comisión.",
        "Apoyo este proyecto de ley de financiamiento educativo porque establece pisos mínimos de inversión. Es un paso necesario aunque insuficiente.",
    ],
    "security": [
        "El aumento del crimen organizado en el conurbano bonaerense requiere una respuesta del Estado. Propongo fortalecer las fuerzas de seguridad y reformar el código penal.",
        "La mano dura no es la solución. Los datos muestran que los países con mayor inversión en prevención y rehabilitación tienen menores tasas de reincidencia.",
        "Esta ley de seguridad afecta garantías constitucionales. La persecución del delito no puede justificar el avance sobre los derechos civiles de los ciudadanos.",
        "El narcotráfico ha penetrado instituciones. Necesitamos mayor transparencia y control ciudadano sobre las fuerzas de seguridad.",
    ],
    "environment": [
        "El cambio climático es una emergencia. Argentina debe asumir compromisos concretos en materia de reducción de emisiones y transición energética.",
        "La megaminería en Patagonia pone en riesgo glaciares y fuentes de agua dulce. Este proyecto de ley desprotege el ambiente en favor de intereses corporativos.",
        "La ley de humedales lleva años bloqueada. Es inadmisible que intereses inmobiliarios y agropecuarios impidan la sanción de una norma que protege ecosistemas esenciales.",
        "Apoyo la transición hacia energías renovables, pero debe hacerse de manera gradual para no destruir empleos en el sector energético tradicional.",
    ],
    "agriculture": [
        "El campo argentino genera las divisas que necesita el país. Las retenciones al agro son un impuesto distorsivo que desincentiva la producción.",
        "El sector agropecuario debe contribuir al desarrollo nacional. No podemos permitir que la renta extraordinaria se fugue al exterior sin aportar al fisco.",
        "Los pequeños productores del NEA y NOA necesitan apoyo diferenciado. El esquema actual beneficia a los grandes pools de siembra y perjudica a las economías regionales.",
        "El litio es el petróleo del siglo XXI. Necesitamos una ley que garantice valor agregado en origen y participación del Estado en la explotación.",
    ],
    "health": [
        "El sistema de salud público está colapsado. Las listas de espera para cirugías oncológicas superan los seis meses en hospitales del interior.",
        "La cobertura de salud mental es un derecho. La ley de salud mental debe implementarse plenamente y contar con presupuesto adecuado.",
        "Me opongo a la privatización de hospitales públicos. La salud es un bien público y no puede quedar en manos del mercado.",
        "El medicamento deja de ser un negocio y pasa a ser un derecho con esta ley. Apoyo el proyecto de genéricos obligatorios.",
    ],
}

EXECUTIVE_AUTHORITIES = [
    {
        "full_name": "Javier Milei",
        "role_title": "Presidente de la Nacion",
        "ministry_or_area": None,
        "photo_url": "https://i.pravatar.cc/150?img=60",
        "started_at": "2023-12-10",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Victoria Villarruel",
        "role_title": "Vicepresidenta de la Nacion",
        "ministry_or_area": None,
        "photo_url": "https://i.pravatar.cc/150?img=47",
        "started_at": "2023-12-10",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Luis Caputo",
        "role_title": "Ministro de Economia",
        "ministry_or_area": "Ministerio de Economia",
        "photo_url": "https://i.pravatar.cc/150?img=55",
        "started_at": "2023-12-10",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Patricia Bullrich",
        "role_title": "Ministra de Seguridad",
        "ministry_or_area": "Ministerio de Seguridad",
        "photo_url": "https://i.pravatar.cc/150?img=48",
        "started_at": "2023-12-10",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Mario Russo",
        "role_title": "Ministro de Salud",
        "ministry_or_area": "Ministerio de Salud",
        "photo_url": "https://i.pravatar.cc/150?img=52",
        "started_at": "2023-12-10",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Sandra Pettovello",
        "role_title": "Ministra de Capital Humano",
        "ministry_or_area": "Ministerio de Capital Humano",
        "photo_url": "https://i.pravatar.cc/150?img=46",
        "started_at": "2023-12-10",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Guillermo Francos",
        "role_title": "Jefe de Gabinete de Ministros",
        "ministry_or_area": "Jefatura de Gabinete",
        "photo_url": "https://i.pravatar.cc/150?img=51",
        "started_at": "2024-03-01",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Diana Mondino",
        "role_title": "Ministra de Relaciones Exteriores",
        "ministry_or_area": "Ministerio de Relaciones Exteriores",
        "photo_url": "https://i.pravatar.cc/150?img=44",
        "started_at": "2023-12-10",
        "ended_at": "2024-11-18",
        "party_id": None,
    },
    {
        "full_name": "Mariano Clucel",
        "role_title": "Ministro del Interior",
        "ministry_or_area": "Ministerio del Interior",
        "photo_url": "https://i.pravatar.cc/150?img=53",
        "started_at": "2023-12-10",
        "ended_at": None,
        "party_id": None,
    },
    {
        "full_name": "Lisandro Catalano",
        "role_title": "Ministro de Infraestructura",
        "ministry_or_area": "Ministerio de Infraestructura",
        "photo_url": "https://i.pravatar.cc/150?img=56",
        "started_at": "2024-06-01",
        "ended_at": None,
        "party_id": None,
    },
]

DECREE_TEMPLATES = [
    ("DNU", "70/2023", "2023-12-20", "dnu",
     "Bases para la reconstruccion de la economia argentina. Desregulacion de mercados y eliminacion de restricciones comerciales."),
    ("Decreto", "29/2024", "2024-01-08", "decreto",
     "Modificacion de la estructura organica del Ministerio de Capital Humano y redistribucion de competencias."),
    ("DNU", "55/2024", "2024-01-15", "dnu",
     "Reforma del sistema previsional. Actualizacion de la formula de movilidad jubilatoria."),
    ("Decreto", "132/2024", "2024-02-05", "decreto",
     "Apertura de importaciones para bienes de capital y tecnologia. Reduccion arancelaria temporal."),
    ("Decreto", "234/2024", "2024-03-12", "decreto",
     "Autorizacion para la emision de deuda en dolares. Canjes de titulos en el marco del programa financiero."),
    ("Resolucion", "45/2024", "2024-03-20", "resolucion",
     "Actualizacion de tarifas de servicios publicos de electricidad y gas natural para usuarios residenciales."),
    ("DNU", "274/2024", "2024-04-01", "dnu",
     "Reforma laboral. Nuevas modalidades de contratacion y modificaciones al regimen de indemnizaciones."),
    ("Decreto", "438/2024", "2024-05-15", "decreto",
     "Adhesion a convenio multilateral con el FMI. Compromisos fiscales y metas de reduccion del deficit."),
    ("Resolucion", "89/2024", "2024-06-03", "resolucion",
     "Reglamentacion del acceso a medicamentos esenciales. Incorporacion de nuevas drogas al vademecum nacional."),
    ("Decreto", "612/2024", "2024-07-08", "decreto",
     "Creacion del Fondo de Sustentabilidad de Infraestructura. Obras prioritarias en vialidad nacional."),
    ("DNU", "690/2024", "2024-08-20", "dnu",
     "Desregulacion del mercado de telecomunicaciones. Apertura a nuevos operadores y reduccion de cargas impositivas al sector."),
    ("Resolucion", "142/2024", "2024-09-10", "resolucion",
     "Normativa de exportacion para el sector agropecuario. Actualizacion de retenciones diferenciadas por producto."),
    ("Decreto", "845/2024", "2024-10-01", "decreto",
     "Plan de obras publicas para el cuarto trimestre. Transferencias a provincias para infraestructura basica."),
    ("DNU", "901/2024", "2024-11-05", "dnu",
     "Reforma del sistema de salud. Modificacion de la ley de obras sociales y creacion del seguro universal de salud."),
    ("Resolucion", "198/2024", "2024-11-18", "resolucion",
     "Actualizacion del salario minimo vital y movil. Revision trimestral y mecanismo de indexacion."),
]

CONGRESS_TODAY_TEMPLATES = [
    {
        "type": "session",
        "title": "Sesión Ordinaria — Debate de Presupuesto 2025",
        "description": "La Cámara de Diputados inicia el debate del proyecto de Ley de Presupuesto 2025. Se esperan más de 40 oradores.",
        "icon": "gavel",
        "hours_ago": 1,
    },
    {
        "type": "vote",
        "title": "Votación: Ley de Financiamiento Universitario",
        "description": "Se aprobó por 142 votos a favor, 89 en contra y 12 abstenciones. El proyecto pasa al Senado.",
        "icon": "how_to_vote",
        "hours_ago": 2,
    },
    {
        "type": "bill",
        "title": "Nuevo proyecto: Ley de Humedales (versión revisada)",
        "description": "La diputada Lucía Martínez presentó una nueva versión del proyecto de ley de humedales con modificaciones en artículos 7 y 12.",
        "icon": "description",
        "hours_ago": 3,
    },
    {
        "type": "speech",
        "title": "Discurso destacado: Economía y ajuste fiscal",
        "description": "Alejandro Vargas tomó la palabra durante 28 minutos abordando el impacto del ajuste sobre las provincias del NOA.",
        "icon": "record_voice_over",
        "hours_ago": 4,
    },
    {
        "type": "vote",
        "title": "Votación: Reforma del Código Penal — Art. 41",
        "description": "Rechazado por 98 votos en contra. El bloque opositor solicitó que vuelva a comisión para revisión.",
        "icon": "how_to_vote",
        "hours_ago": 5,
    },
    {
        "type": "bill",
        "title": "Proyecto ingresado: Creación del Fondo de Desarrollo Regional",
        "description": "Firmado por 23 legisladores de distintos bloques. Propone redistribuir regalías energéticas a municipios afectados.",
        "icon": "description",
        "hours_ago": 6,
    },
    {
        "type": "session",
        "title": "Comisión de Salud: Audiencia pública sobre medicamentos genéricos",
        "description": "Se escucharon testimonios de representantes de laboratorios nacionales y de organizaciones de pacientes.",
        "icon": "groups",
        "hours_ago": 7,
    },
]

UPCOMING_SESSIONS = [
    {"title": "Sesión Especial: Ley de Empleo Joven", "date": "2024-11-20"},
    {"title": "Sesión Ordinaria: Reforma Previsional", "date": "2024-11-27"},
    {"title": "Comisión de Presupuesto: Revisión de gastos", "date": "2024-12-03"},
    {"title": "Sesión de Cierre: Balance legislativo 2024", "date": "2024-12-10"},
]

USER_ALERTS_TEMPLATES = [
    {
        "type": "contradiction",
        "title": "Contradicción detectada: Alejandro Vargas",
        "description": "El legislador habló a favor de la educación pública pero votó a favor del recorte presupuestario universitario.",
        "hours_ago": 1,
        "read": False,
    },
    {
        "type": "topic_surge",
        "title": "Aumento de actividad: Minería y Recursos",
        "description": "Las menciones al tema Minería crecieron un 340% en las últimas 48hs. 8 nuevos discursos registrados.",
        "hours_ago": 3,
        "read": False,
    },
    {
        "type": "bill_advance",
        "title": "Proyecto avanzó de comisión a plenario",
        "description": "El proyecto de Ley de Humedales pasó de comisión a tratamiento en plenario. Fecha tentativa: 27 de noviembre.",
        "hours_ago": 6,
        "read": False,
    },
    {
        "type": "vote",
        "title": "Votación importante: Financiamiento universitario",
        "description": "La Ley de Financiamiento Universitario fue aprobada con 142 votos. Seguís el tema Educación.",
        "hours_ago": 8,
        "read": True,
    },
    {
        "type": "contradiction",
        "title": "Nueva contradicción: María Fernández",
        "description": "Detectamos una contradicción entre su discurso del 12/11 sobre salud y su voto en la sesión del 14/11.",
        "hours_ago": 24,
        "read": True,
    },
    {
        "type": "topic_surge",
        "title": "Tendencia: Derechos Humanos",
        "description": "El tema Derechos Humanos registra momentum máximo esta semana con 15 proyectos nuevos ingresados.",
        "hours_ago": 48,
        "read": True,
    },
]

BILL_TEMPLATES = [
    "Proyecto de ley de reforma tributaria integral",
    "Proyecto de ley de financiamiento universitario",
    "Proyecto de ley de seguridad ciudadana",
    "Proyecto de ley de humedales",
    "Proyecto de ley de litio y recursos naturales estratégicos",
    "Proyecto de ley de salario mínimo vital y móvil",
    "Proyecto de ley de inversión en infraestructura vial",
    "Proyecto de ley de deuda soberana",
    "Proyecto de ley de economía del conocimiento",
    "Proyecto de ley de medicamentos genéricos",
    "Proyecto de reforma previsional",
    "Proyecto de ley de emergencia alimentaria",
]


def generate_consistency_grade(score: float) -> str:
    if score >= 9.0: return "A+"
    elif score >= 8.5: return "A"
    elif score >= 8.0: return "A-"
    elif score >= 7.5: return "B+"
    elif score >= 7.0: return "B"
    elif score >= 6.5: return "B-"
    elif score >= 6.0: return "C+"
    elif score >= 5.5: return "C"
    elif score >= 5.0: return "C-"
    else: return "D"


def build_seed_data():
    """Construye todos los datos simulados en memoria como dicts"""

    # IDs para referencias cruzadas
    institution_ids = [str(uuid.uuid4()) for _ in INSTITUTIONS]
    party_ids       = [str(uuid.uuid4()) for _ in PARTIES]
    topic_ids       = [str(uuid.uuid4()) for _ in TOPICS]
    politician_ids  = [str(uuid.uuid4()) for _ in POLITICIANS_DATA]

    # ── Institutions
    institutions = []
    for i, inst in enumerate(INSTITUTIONS):
        institutions.append({
            "id": institution_ids[i],
            **inst,
            "country": "AR",
            "created_at": "2024-01-01T00:00:00Z",
        })

    # ── Parties
    parties = []
    for i, party in enumerate(PARTIES):
        parties.append({
            "id": party_ids[i],
            **party,
            "founded_at": "2000-01-01",
            "created_at": "2024-01-01T00:00:00Z",
        })

    # ── Topics
    topics = []
    for i, topic in enumerate(TOPICS):
        mention_count = random.randint(80, 900)
        bill_count = random.randint(1, 20)
        speech_count = random.randint(40, 300)
        momentum = round(random.uniform(0.1, 1.0), 2)
        topics.append({
            "id": topic_ids[i],
            "name": topic["name"],
            "slug": topic["slug"],
            "description": f"Análisis de discurso público versus actividad legislativa efectiva en materia de {topic['name'].lower()}.",
            "policy_area": topic["policy_area"],
            "color_hex": topic["color_hex"],
            "hero_image_url": None,
            "mention_count": mention_count,
            "bill_count": bill_count,
            "speech_count": speech_count,
            "momentum_score": momentum,
            "discourse_gap_score": topic["gap_score"],
            "discourse_gap_label": topic["gap_label"],
            "last_calculated_at": "2024-11-15T10:00:00Z",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-11-15T10:00:00Z",
        })

    # ── Politicians
    politicians = []
    politician_party_map = {}
    for i, pol in enumerate(POLITICIANS_DATA):
        score = round(random.uniform(4.5, 9.8), 1)
        party_idx = random.randint(0, len(PARTIES) - 1)
        politician_party_map[politician_ids[i]] = party_ids[party_idx]
        politicians.append({
            "id": politician_ids[i],
            "full_name": pol["full_name"],
            "first_name": pol["full_name"].split()[0],
            "last_name": " ".join(pol["full_name"].split()[1:]),
            "gender": pol["gender"],
            "birth_date": fake.date_of_birth(minimum_age=35, maximum_age=72).isoformat(),
            "province": pol["province"],
            "photo_url": pol["photo"],
            "bio": f"Político argentino de {pol['province']}. Referente en temas de {random.choice(TOPICS)['name']} y {random.choice(TOPICS)['name']}.",
            "consistency_score": score,
            "consistency_grade": generate_consistency_grade(score),
            "activity_score": round(random.uniform(0.3, 1.0), 2),
            "last_analyzed_at": "2024-11-15T10:00:00Z",
            "external_id": f"ARG-{random.randint(10000, 99999)}",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-11-15T10:00:00Z",
        })

    # ── Politician Roles
    roles = []
    role_titles = ["Diputado Nacional", "Senador Nacional", "Diputado Provincial"]
    for i, pol_id in enumerate(politician_ids):
        # Rol actual
        roles.append({
            "id": str(uuid.uuid4()),
            "politician_id": pol_id,
            "institution_id": institution_ids[0],  # HCD
            "party_id": politician_party_map[pol_id],
            "role_title": random.choice(role_titles),
            "started_at": "2023-12-10",
            "ended_at": None,
            "district": POLITICIANS_DATA[i]["province"],
            "created_at": "2024-01-01T00:00:00Z",
        })
        # Rol anterior (50% de los políticos)
        if random.random() > 0.5:
            roles.append({
                "id": str(uuid.uuid4()),
                "politician_id": pol_id,
                "institution_id": institution_ids[0],
                "party_id": politician_party_map[pol_id],
                "role_title": "Concejal Municipal",
                "started_at": "2019-12-10",
                "ended_at": "2023-12-09",
                "district": POLITICIANS_DATA[i]["province"],
                "created_at": "2024-01-01T00:00:00Z",
            })

    # ── Sessions (20 sesiones en 2024)
    sessions = []
    session_ids = []
    session_types = ["ordinaria", "extraordinaria", "especial"]
    start_date = date(2024, 3, 1)
    for s in range(20):
        sid = str(uuid.uuid4())
        session_ids.append(sid)
        sess_date = start_date + timedelta(days=s * 14)
        sessions.append({
            "id": sid,
            "institution_id": institution_ids[0],
            "title": f"Sesión Ordinaria {700 + s} — {sess_date.strftime('%B %Y').capitalize()}",
            "session_number": f"{700 + s}",
            "session_type": random.choice(session_types),
            "date": sess_date.isoformat(),
            "started_at": f"{sess_date.isoformat()}T10:00:00Z",
            "ended_at": f"{sess_date.isoformat()}T{random.randint(17,21):02d}:00:00Z",
            "status": "completed",
            "processing_status": "done",
            "speech_count": random.randint(15, 45),
            "word_count": random.randint(8000, 35000),
            "external_id": f"HCD-2024-{700 + s}",
            "created_at": f"{sess_date.isoformat()}T00:00:00Z",
            "updated_at": f"{sess_date.isoformat()}T23:00:00Z",
        })

    # ── Bills (30 proyectos)
    bills = []
    bill_ids = []
    policy_areas = [t["policy_area"] for t in TOPICS]
    bill_statuses = ["draft", "committee", "floor", "passed", "enacted", "rejected"]
    bill_weights  = [0.2,     0.3,        0.2,     0.1,      0.1,       0.1]
    for b in range(30):
        bid = str(uuid.uuid4())
        bill_ids.append(bid)
        introduced = date(2024, random.randint(1, 10), random.randint(1, 28))
        status = random.choices(bill_statuses, weights=bill_weights)[0]
        bills.append({
            "id": bid,
            "institution_id": institution_ids[0],
            "title": random.choice(BILL_TEMPLATES) + f" — Expte. 2024-D-{random.randint(1000,9999)}",
            "number": f"2024-D-{random.randint(1000,9999)}",
            "summary": fake.paragraph(nb_sentences=2),
            "policy_area": random.choice(policy_areas),
            "status": status,
            "introduced_at": introduced.isoformat(),
            "enacted_at": (introduced + timedelta(days=random.randint(30, 180))).isoformat() if status == "enacted" else None,
            "external_id": f"HCD-BILL-{random.randint(10000,99999)}",
            "created_at": f"{introduced.isoformat()}T00:00:00Z",
            "updated_at": "2024-11-15T00:00:00Z",
        })

    # ── Votes (40 votaciones)
    votes = []
    vote_ids = []
    for v in range(40):
        vid = str(uuid.uuid4())
        vote_ids.append(vid)
        sess = random.choice(sessions)
        yes = random.randint(80, 180)
        no  = random.randint(20, 120)
        abs = random.randint(0, 20)
        votes.append({
            "id": vid,
            "session_id": sess["id"],
            "bill_id": random.choice(bill_ids) if random.random() > 0.3 else None,
            "title": f"Votación: {random.choice(BILL_TEMPLATES)[:60]}",
            "vote_type": random.choice(["general", "en particular", "moción de orden"]),
            "result": "aprobado" if yes > no else "rechazado",
            "yes_count": yes,
            "no_count": no,
            "abstain_count": abs,
            "absent_count": 257 - yes - no - abs,
            "voted_at": sess["started_at"],
            "external_id": f"VOTE-2024-{random.randint(1000,9999)}",
            "created_at": sess["created_at"],
        })

    # ── VotePositions (cada político vota en 70% de las votaciones)
    vote_positions = []
    for vid in vote_ids:
        for pol_id in politician_ids:
            if random.random() < 0.70:
                pos = random.choices(
                    ["yes", "no", "abstain", "absent"],
                    weights=[0.45, 0.30, 0.10, 0.15]
                )[0]
                vote_positions.append({
                    "id": str(uuid.uuid4()),
                    "vote_id": vid,
                    "politician_id": pol_id,
                    "position": pos,
                    "party_id": politician_party_map[pol_id],
                    "created_at": "2024-01-01T00:00:00Z",
                })

    # ── Speeches (5-15 discursos por sesión)
    speeches = []
    speech_analyses = []
    speech_ids_list = []
    policy_areas_list = list(SPEECH_TEMPLATES.keys())

    for sess in sessions:
        n_speeches = random.randint(5, 15)
        for order in range(n_speeches):
            sid = str(uuid.uuid4())
            speech_ids_list.append(sid)
            pol_id = random.choice(politician_ids)
            pol_data = next(p for p in POLITICIANS_DATA if p["full_name"] == POLITICIANS_DATA[politician_ids.index(pol_id)]["full_name"])
            policy = random.choice(policy_areas_list)
            template = random.choice(SPEECH_TEMPLATES[policy])
            transcript = template.format(
                action=random.choice(["una política de tipo de cambio diferencial", "un programa de reducción de subsidios gradual", "la implementación de cepo cambiario"]),
                problem=random.choice(["gasta más de lo que recauda", "no puede financiar servicios básicos", "desalienta la inversión privada"]),
                alternative=random.choice(["un ingreso básico universal", "mayor progresividad fiscal", "redistribución del gasto público"]),
                bill_count=random.randint(3, 12),
            )

            stance_opts = ["support", "oppose", "neutral", "mixed"]
            stance_weights = [0.3, 0.35, 0.2, 0.15]
            stance = random.choices(stance_opts, weights=stance_weights)[0]

            sentiment_map = {
                "support": ("positive", random.uniform(0.3, 0.9)),
                "oppose":  ("negative", random.uniform(-0.9, -0.3)),
                "neutral": ("neutral",  random.uniform(-0.2, 0.2)),
                "mixed":   ("neutral",  random.uniform(-0.3, 0.3)),
            }
            sentiment, sent_score = sentiment_map[stance]

            speeches.append({
                "id": sid,
                "session_id": sess["id"],
                "politician_id": pol_id,
                "speaker_label": f"DIPUTADO/A {POLITICIANS_DATA[politician_ids.index(pol_id)]['full_name'].upper()}",
                "transcript": transcript,
                "word_count": len(transcript.split()),
                "duration_seconds": random.randint(60, 480),
                "start_time": order * random.randint(300, 600),
                "end_time": (order + 1) * random.randint(300, 600),
                "sequence_order": order,
                "embedding_model": "text-embedding-3-small",
                "created_at": sess["created_at"],
            })

            # Análisis del discurso
            topic_obj = random.choice(TOPICS)
            speech_analyses.append({
                "id": str(uuid.uuid4()),
                "speech_id": sid,
                "topic": topic_obj["name"],
                "topic_cluster": topic_obj["slug"],
                "policy_area": policy,
                "summary": f"El legislador {'apoya' if stance == 'support' else 'se opone a' if stance == 'oppose' else 'analiza'} las políticas de {topic_obj['name'].lower()}, destacando el impacto en la ciudadanía.",
                "stance": stance,
                "sentiment": sentiment,
                "sentiment_score": round(sent_score, 2),
                "keywords": random.sample(["presupuesto", "reforma", "inversión", "empleo", "derechos", "Estado", "mercado", "inflación", "ley", "decreto"], k=4),
                "confidence": round(random.uniform(0.72, 0.97), 2),
                "model_used": "gpt-4o-mini",
                "created_at": sess["created_at"],
            })

    # ── Consistency Scores
    consistency_scores = []
    for pol_id in politician_ids:
        pol = next(p for p in politicians if p["id"] == pol_id)
        score = pol["consistency_score"]
        # Score global
        speech_count = random.randint(10, 60)
        vote_count = random.randint(15, 40)
        contradiction_count = max(0, int((10 - score) * random.uniform(0.3, 0.8)))
        consistency_scores.append({
            "id": str(uuid.uuid4()),
            "politician_id": pol_id,
            "topic_id": None,
            "policy_area": None,
            "score": score,
            "grade": generate_consistency_grade(score),
            "speech_count": speech_count,
            "vote_count": vote_count,
            "contradiction_count": contradiction_count,
            "alignment_count": vote_count - contradiction_count,
            "period_start": "2024-01-01",
            "period_end": "2024-11-15",
            "calculated_at": "2024-11-15T10:00:00Z",
        })
        # Scores por tema (top 3)
        for topic_obj in random.sample(TOPICS, 3):
            t_score = round(random.uniform(4.0, 9.8), 1)
            consistency_scores.append({
                "id": str(uuid.uuid4()),
                "politician_id": pol_id,
                "topic_id": topic_ids[TOPICS.index(topic_obj)],
                "policy_area": topic_obj["policy_area"],
                "score": t_score,
                "grade": generate_consistency_grade(t_score),
                "speech_count": random.randint(2, 15),
                "vote_count": random.randint(2, 10),
                "contradiction_count": max(0, int((10 - t_score) * 0.4)),
                "alignment_count": random.randint(3, 12),
                "period_start": "2024-01-01",
                "period_end": "2024-11-15",
                "calculated_at": "2024-11-15T10:00:00Z",
            })

    # ── Contradictions (2-4 por político)
    contradictions = []
    contradiction_descriptions = [
        "El legislador declaró {stance_text} el proyecto en discurso del {date}, pero votó {vote_text} en la sesión posterior.",
        "Contradicción detectada: el representante promovió {topic} durante la campaña, pero su voto en comisión fue contrario a los proyectos presentados.",
        "El legislador pidió mayor presupuesto para {area} en múltiples intervenciones, pero votó a favor del recorte en la votación de presupuesto.",
    ]
    for pol_id in politician_ids:
        n_contradictions = random.randint(0, 4)
        for _ in range(n_contradictions):
            speech_id = random.choice(speech_ids_list)
            vote_id = random.choice(vote_ids)
            topic_obj = random.choice(TOPICS)
            severity = random.choices(["low", "medium", "high", "critical"], weights=[0.3, 0.4, 0.2, 0.1])[0]
            contradictions.append({
                "id": str(uuid.uuid4()),
                "politician_id": pol_id,
                "speech_id": speech_id,
                "vote_id": vote_id,
                "topic_id": topic_ids[TOPICS.index(topic_obj)],
                "description": random.choice(contradiction_descriptions).format(
                    stance_text="apoyar" if random.random() > 0.5 else "rechazar",
                    date=fake.date_this_year().strftime("%d/%m/%Y"),
                    vote_text="afirmativo" if random.random() > 0.5 else "negativo",
                    topic=topic_obj["name"].lower(),
                    area=topic_obj["policy_area"],
                ),
                "severity": severity,
                "speech_stance": random.choice(["support", "oppose"]),
                "vote_position": random.choice(["yes", "no"]),
                "similarity_score": round(random.uniform(0.65, 0.95), 3),
                "detected_at": "2024-11-15T10:00:00Z",
                "is_flagged": True,
                "reviewed": random.random() > 0.7,
            })

    # ── Alliance Scores
    alliance_scores = []
    for i in range(len(politician_ids)):
        for j in range(i + 1, len(politician_ids)):
            if random.random() < 0.4:  # 40% de pares tienen score calculado
                pol_a = politician_ids[i]
                pol_b = politician_ids[j]
                same_party = politician_party_map[pol_a] == politician_party_map[pol_b]
                # Mismo partido → mayor alineación
                alignment = round(random.uniform(0.7, 0.98) if same_party else random.uniform(0.2, 0.75), 3)
                alliance_scores.append({
                    "id": str(uuid.uuid4()),
                    "politician_a_id": pol_a,
                    "politician_b_id": pol_b,
                    "same_party": same_party,
                    "alignment_rate": alignment,
                    "vote_count": random.randint(10, 40),
                    "topic_id": None,
                    "period_start": "2024-01-01",
                    "period_end": "2024-11-15",
                    "calculated_at": "2024-11-15T10:00:00Z",
                })

    # ── Discourse Gaps
    discourse_gaps = []
    for i, topic_obj in enumerate(TOPICS):
        mention_count = random.randint(80, 900)
        laws_enacted = random.randint(0, 5)
        gap_ratio = round(mention_count / max(laws_enacted, 1), 1)
        discourse_gaps.append({
            "id": str(uuid.uuid4()),
            "topic_id": topic_ids[i],
            "institution_id": institution_ids[0],
            "mention_count": mention_count,
            "speech_count": random.randint(40, 250),
            "politician_count": random.randint(8, 50),
            "bills_introduced": random.randint(2, 25),
            "bills_passed": random.randint(0, 8),
            "laws_enacted": laws_enacted,
            "gap_ratio": gap_ratio,
            "gap_label": f"{int(gap_ratio)}x",
            "gap_severity": "critical" if gap_ratio > 100 else "high" if gap_ratio > 50 else "medium" if gap_ratio > 20 else "low",
            "period_start": "2024-01-01",
            "period_end": "2024-11-15",
            "calculated_at": "2024-11-15T10:00:00Z",
        })

    # ── Congress Today events
    congress_today = []
    base_date = datetime(2024, 11, 15, 18, 0, 0)
    for tmpl in CONGRESS_TODAY_TEMPLATES:
        event_time = base_date - timedelta(hours=tmpl["hours_ago"])
        congress_today.append({
            "id": str(uuid.uuid4()),
            "type": tmpl["type"],
            "title": tmpl["title"],
            "description": tmpl["description"],
            "date": event_time.isoformat() + "Z",
            "icon": tmpl["icon"],
            "related_ids": [],
        })

    # ── Upcoming Sessions
    upcoming_sessions = []
    for sess in UPCOMING_SESSIONS:
        upcoming_sessions.append({
            "id": str(uuid.uuid4()),
            "title": sess["title"],
            "date": sess["date"],
            "institution": "HCD",
        })

    # ── User Alerts
    user_alerts = []
    for tmpl in USER_ALERTS_TEMPLATES:
        alert_time = base_date - timedelta(hours=tmpl["hours_ago"])
        user_alerts.append({
            "id": str(uuid.uuid4()),
            "type": tmpl["type"],
            "title": tmpl["title"],
            "description": tmpl["description"],
            "date": alert_time.isoformat() + "Z",
            "read": tmpl["read"],
            "related_id": None,
        })

    # ── Monthly Consistency (12 meses por partido)
    monthly_consistency = []
    months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov"]
    for month_idx, month_label in enumerate(months):
        for party in PARTIES:
            base_score = random.uniform(5.5, 8.5)
            monthly_consistency.append({
                "month": month_label,
                "party_short": party["short_name"],
                "avg_score": round(base_score + random.uniform(-0.8, 0.8), 1),
            })

    # ── User Preferences (mock: Sofía sigue 3 temas)
    followed_topic_slugs = ["economia", "educacion", "medio-ambiente", "seguridad"]
    user_preferences = {
        "followed_topic_ids": [
            topic_ids[TOPICS.index(next(t for t in TOPICS if t["slug"] == slug))]
            for slug in followed_topic_slugs
        ],
        "followed_politician_ids": politician_ids[:3],
    }

    # ── Demo User
    users = [{
        "id": str(uuid.uuid4()),
        "email": "sofia@example.com",
        "full_name": "Sofía García",
        "profile_type": "citizen",
        "avatar_url": "https://i.pravatar.cc/150?img=47",
        "created_at": "2024-01-01T00:00:00Z",
    }]

    # ── Executive Authorities
    executive_authorities = []
    for auth in EXECUTIVE_AUTHORITIES:
        executive_authorities.append({
            "id": str(uuid.uuid4()),
            **auth,
        })

    # ── Executive Decrees & Resolutions
    executive_decrees = []
    for (_, dec_number, dec_date, dec_type, dec_summary) in DECREE_TEMPLATES:
        executive_decrees.append({
            "id": str(uuid.uuid4()),
            "number": dec_number,
            "date": dec_date,
            "type": dec_type,
            "summary": dec_summary,
            "source_url": None,
        })

    return {
        "institutions": institutions,
        "parties": parties,
        "topics": topics,
        "politicians": politicians,
        "politician_roles": roles,
        "sessions": sessions,
        "bills": bills,
        "votes": votes,
        "vote_positions": vote_positions,
        "speeches": speeches,
        "speech_analyses": speech_analyses,
        "consistency_scores": consistency_scores,
        "contradictions": contradictions,
        "alliance_scores": alliance_scores,
        "discourse_gaps": discourse_gaps,
        "users": users,
        "executive_authorities": executive_authorities,
        "executive_decrees": executive_decrees,
        "congress_today": congress_today,
        "upcoming_sessions": upcoming_sessions,
        "user_alerts": user_alerts,
        "monthly_consistency": monthly_consistency,
        "user_preferences": user_preferences,
    }


if __name__ == "__main__":
    import json
    data = build_seed_data()
    print("Seed generado:")
    for key, val in data.items():
        print(f"   {key}: {len(val)} registros")

    with open("seed_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    print("\nGuardado en seed_data.json")
