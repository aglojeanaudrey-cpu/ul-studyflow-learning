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
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
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
            },
            'CONN_MAX_AGE': 600,
        }
    }
else:
    # Fallback to local SQLite when Supabase credentials are not yet populated in .env
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
        'rest_framework.authentication.SessionAuthentication',
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
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = 'None'   # CRITIQUE : permet le cross-origin
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = 'None' 

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