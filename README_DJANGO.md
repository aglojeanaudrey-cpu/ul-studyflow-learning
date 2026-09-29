# UL STUDY FLOW LEARNING - Backend Django REST API

Ce projet a été intégralement converti de **Node.js (Express.js)** vers **Python (Django & Django REST Framework)**.

---

## 🚀 Démarrage Rapide

### 1. Activer l'environnement virtuel Python
```bash
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Linux / MacOS
source .venv/bin/activate
```

### 2. Lancer le serveur Backend Django
```bash
python manage.py runserver 0.0.0.0:8000
```
Le backend sera disponible sur `http://127.0.0.1:8000`.

### 3. Lancer le Frontend React (Vite)
Dans un autre terminal :
```bash
npm run dev
```
Le frontend démarrera sur `http://localhost:5173` et redirigera automatiquement toutes les requêtes `/api/*` vers le backend Django (`http://127.0.0.1:8000`).

---

## 🔐 Identifiants par défaut

- **Super Administrateur :**
  - **Téléphone :** `+22899705920` (ou `99705920`)
  - **Mot de passe :** `Comprendre-apprendre-progresser2026`
  - **Nom :** Kokou Jean-Audrey Aglo

---

## 📂 Architecture du Projet Django

```
ulstudyflow/
├── backend/
│   ├── studyflow/              # Configuration globale du projet Django
│   │   ├── settings.py         # Réglages (CORS, REST Framework, Gemini API)
│   │   ├── urls.py             # Routeur principal de toutes les APIs
│   │   ├── wsgi.py / asgi.py
│   │
│   ├── accounts/               # Authentification & Utilisateurs
│   │   ├── models.py           # Modèle Custom User & AuthToken
│   │   ├── authentication.py   # Authentification Bearer token (ulsf_...)
│   │   ├── permissions.py      # Rôles (USER, STAFF, SUPERUSER)
│   │   ├── serializers.py      # Sérialiseurs (camelCase pour React)
│   │   └── views.py            # Inscription, Connexion, Profil, Admin Users
│   │
│   ├── academic/               # Structure Universitaire
│   │   ├── models.py           # Department, Program, AcademicYear
│   │   ├── serializers.py
│   │   └── views.py            # Métadonnées et CRUD Admin
│   │
│   ├── courses/                # Cours, Séances & Évaluations
│   │   ├── models.py           # UE, Session, Quiz, Question, Access, Progress
│   │   ├── serializers.py
│   │   ├── views.py            # Catalogue, Progression, Quizz, Admin CRUD
│   │   └── management/commands/seed_data.py # Commande de chargement
│   │
│   ├── forms_builder/          # Formulaires Dynamiques
│   │   ├── models.py           # DynamicForm, FormSubmission
│   │   ├── serializers.py
│   │   └── views.py            # Rendu public, Soumission, Export CSV Excel
│   │
│   ├── monetization/           # Tarification & Codes Promos
│   │   ├── models.py           # PromoCode, UnlockRequest, PlatformConfig
│   │   ├── serializers.py
│   │   └── views.py            # Validation promo, déblocage, réglages plateforme
│   │
│   ├── audit/                  # Journalisation & Statistiques
│   │   ├── models.py           # AuditLog
│   │   ├── utils.py            # Fonction log_audit()
│   │   └── views.py            # Logs d'audit, Stats globales, Contact, Exports
│   │
│   └── assistant_ai/           # Assistant Pédagogique IA
│       ├── service.py          # Intégration Google Gemini avec garde-fous
│       └── views.py            # Endpoint API /api/ai/ask
│
├── manage.py                   # Script de gestion racine Django
├── requirements.txt            # Dépendances Python
└── vite.config.ts              # Configuration Vite avec Proxy vers Django
```

---

## 🛠️ Commandes Utiles

- **Appliquer les migrations :**
  ```bash
  python manage.py migrate
  ```
- **Recharger les données initiales :**
  ```bash
  python manage.py seed_data
  ```
- **Accéder à l'interface d'administration Django :**
  Rendez-vous sur `http://127.0.0.1:8000/admin/`
