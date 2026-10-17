import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BASE_DIR.parent

# Load environment variables from .env and .env.local in root
load_dotenv(WORKSPACE_DIR / '.env')
load_dotenv(WORKSPACE_DIR / '.env.local')
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-ulstudyflow-learning-secret-key-togo-2026')

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'corsheaders',
    'rest_framework',

    # UL Study Flow local applications
    'accounts.apps.AccountsConfig',
    'academic.apps.AcademicConfig',
    'courses.apps.CoursesConfig',
    'forms_builder.apps.FormsBuilderConfig',
    'monetization.apps.MonetizationConfig',
    'audit.apps.AuditConfig',
    'assistant_ai.apps.AssistantAiConfig',
    'notifications.apps.NotificationsConfig',
    'ads.apps.AdsConfig',
    'referrals.apps.ReferralsConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'studyflow.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'studyflow.wsgi.application'

# -----------------------------------------------------------------------------
# Database Configuration: Supabase (PostgreSQL) & Local SQLite Fallback
# -----------------------------------------------------------------------------
import dj_database_url

DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('SUPABASE_DB_URL')
SUPABASE_DB_HOST = os.getenv('SUPABASE_DB_HOST') or os.getenv('DB_HOST')

if DATABASE_URL:
    # Détection du Transaction Pooler (port 6543)
    # En mode pooler, on doit désactiver les prepared statements psycopg3
    # pour éviter les conflits de session.
    is_pooler = ':6543' in DATABASE_URL or 'pooler.supabase.com' in DATABASE_URL

    _db_config = dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=60,          # Réduit pour éviter la saturation du pooler
        conn_health_checks=True,
        ssl_require=True,
    )

    # psycopg3 : désactiver les prepared statements en mode pooler
    if is_pooler:
        _db_config.setdefault('OPTIONS', {})
        _db_config['OPTIONS']['prepare_threshold'] = None

    DATABASES = {'default': _db_config}

elif SUPABASE_DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('SUPABASE_DB_NAME') or os.getenv('DB_NAME') or 'postgres',
            'USER': os.getenv('SUPABASE_DB_USER') or os.getenv('DB_USER') or 'postgres',
            'PASSWORD': os.getenv('SUPABASE_DB_PASSWORD') or os.getenv('DB_PASSWORD') or '',
            'HOST': SUPABASE_DB_HOST,
            'PORT': os.getenv('SUPABASE_DB_PORT') or os.getenv('DB_PORT') or '5432',
            'OPTIONS': {
                'sslmode': 'require',
                'prepare_threshold': None,  # psycopg3 pooler-safe
            },
            'CONN_MAX_AGE': 60,
        }
    }
else:
    # Fallback SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Supabase API & Project Keys
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET', '')
SUPABASE_JWT_ISSUER = os.getenv('SUPABASE_JWT_ISSUER', 'ulstudyflow')
SUPABASE_JWT_TTL_SECONDS = 300


# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 6}
    },
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Lome'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Headers configuration
APP_URL = os.getenv('APP_URL', 'https://ul-studyflow-learning.pages.dev').rstrip('/')
CORS_ALLOWED_ORIGINS = [
    APP_URL,
]
CORS_ALLOW_CREDENTIALS = True

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.ULSFTokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '120/minute',
        'login': '5/minute',       # 5 tentatives/min par IP
        'register': '3/minute',    # 3 inscriptions/min par IP
    },
}

# -----------------------------------------------------------------------------
# Assistant Pédagogique UL Study Flow — Configuration
# -----------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

# Support & contact (à remplir via .env quand les numéros seront fonctionnels)
SUPPORT_PHONE = os.getenv('SUPPORT_PHONE', '')          # ex: "+228 XX XX XX XX"
SUPPORT_PHONE_ALT = os.getenv('SUPPORT_PHONE_ALT', '')  # ex: "+228 XX XX XX XX"
SUPPORT_EMAIL = os.getenv('SUPPORT_EMAIL', '')
SUPPORT_FAQ_URL = os.getenv('SUPPORT_FAQ_URL', '/faq')

# Limites de sécurité de l'assistant IA
AI_MAX_MESSAGE_LENGTH = 2000
AI_MAX_HISTORY_MESSAGES = 10

# Security Hardening
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Cookies de session
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True              # FORCÉ à True en prod
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_AGE = 7 * 24 * 60 * 60     # 7 jours
SESSION_EXPIRE_AT_BROWSER_CLOSE = False   # Persiste entre sessions

# Cookies CSRF
CSRF_COOKIE_HTTPONLY = False              # JS doit pouvoir lire le CSRF token
CSRF_COOKIE_SECURE = True                 # FORCÉ à True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_AGE = 7 * 24 * 60 * 60        # 7 jours (par défaut = session)

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://ul-studyflow-learning.pages.dev',       # domaine Cloudflare
    'https://ul-studyflow-learning.onrender.com', # domaine render
    APP_URL,
]

# -----------------------------------------------------------------------------
# Cloudinary — Upload de médias (audio, vidéo, images)
# -----------------------------------------------------------------------------
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', '')

# Configurer Cloudinary SDK
if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    import cloudinary
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,  # Force HTTPS
    )

# ═══════════════════════════════════════════════════════════════
# SENTRY — Monitoring des erreurs (production uniquement)
# ═══════════════════════════════════════════════════════════════
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

SENTRY_DSN = os.getenv('SENTRY_DSN', '')

if SENTRY_DSN and not DEBUG:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(
                transaction_style='url',
            ),
        ],
        # 10% des requêtes HTTP seront tracées (performance monitoring)
        traces_sample_rate=0.1,  # [citation:1][citation:5]
        # Important : ne PAS envoyer les données personnelles
        send_default_pii=False,
        environment='production',
        # Release = version de ton déploiement (Render met souvent le commit SHA)
        release=os.getenv('RENDER_GIT_COMMIT', 'dev'),
    )