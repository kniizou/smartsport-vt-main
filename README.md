# SmartSport VT

## Présentation
SmartSport VT est une plateforme de gestion de tournois sportifs, permettant l'inscription, la gestion des équipes, des rencontres, des paiements et la consultation de FAQ. Le projet est structuré en deux parties :
- **Backend** : Django + Django REST Framework
- **Frontend** : Vue.js

## Structure du projet
```
smartsport-vt-main/
├── backend/                # Backend Django
│   ├── manage.py
│   ├── tournois/          # App principale (modèles, vues, serializers)
│   └── ...
├── frontend/
│   └── smartsport-frontend/ # Frontend Vue.js
└── README.md
```

## Prérequis
- Python 3.9+
- Node.js 16+
- PostgreSQL

## Installation Backend
1. **Cloner le dépôt**
```bash
git clone <url-du-repo>
cd smartsport-vt-main/smartsport-vt-main/backend
```
2. **Créer et activer un environnement virtuel**
```bash
python -m venv .venv
.venv\Scripts\activate
```
3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```
4. **Configurer la base de données PostgreSQL**
- Créer une base de données et un utilisateur PostgreSQL :
```sql
CREATE DATABASE smartsport;
CREATE USER smartsport_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE smartsport TO smartsport_user;
```
- Adapter le fichier `backend/settings.py` avec vos identifiants PostgreSQL.

5. **Appliquer les migrations**
```bash
python manage.py makemigrations\python manage.py migrate
```
6. **Créer un superutilisateur**
```bash
python manage.py createsuperuser
```
7. **Lancer le serveur de développement**
```bash
python manage.py runserver
```

## Installation Frontend
1. **Installer les dépendances**
```bash
cd ../frontend/smartsport-frontend
npm install
```
2. **Lancer le serveur de développement**
```bash
npm run dev
```

## Documentation API (extraits)
- Accès à la documentation interactive : [http://localhost:8000/swagger/](http://localhost:8000/swagger/)

### Authentification & Utilisateurs
- `POST /api/register/` : Inscription d'un nouvel utilisateur
- `POST /api/login/` : Connexion (JWT)
- `GET /api/utilisateurs/` : Liste des utilisateurs

### Tournois
- `GET /api/tournois/` : Liste des tournois
- `POST /api/tournois/` : Création d'un tournoi (organisateur)

### Équipes & Joueurs
- `GET /api/equipes/` : Liste des équipes
- `POST /api/equipes/` : Création d'une équipe
- `GET /api/joueurs/` : Liste des joueurs

### Rencontres
- `GET /api/rencontres/` : Liste des rencontres
- `POST /api/rencontres/` : Création d'une rencontre

### Paiements
- `GET /api/paiements/` : Liste des paiements
- `POST /api/paiements/` : Enregistrement d'un paiement

### FAQ
- `GET /api/faq/` : Liste des questions fréquentes

## Commandes utiles
- **Créer la base de données** : voir section PostgreSQL ci-dessus
- **Appliquer les migrations** :
  - `python manage.py makemigrations`
  - `python manage.py migrate`
- **Créer un superutilisateur** :
  - `python manage.py createsuperuser`
- **Lancer le backend** :
  - `python manage.py runserver`
- **Lancer le frontend** :
  - `npm run dev` (dans `frontend/smartsport-frontend`)

## Conseils pour le développement local
- Utiliser l'environnement virtuel Python pour le backend
- Adapter les variables d'environnement pour la base de données si besoin
- Accéder à l'admin Django via `/admin/`
- Tester les endpoints via Swagger ou Postman

## Contribution
Les contributions sont les bienvenues ! Merci de créer une issue ou une pull request pour toute suggestion ou amélioration.

---
Pour toute question, consultez la FAQ ou contactez l'équipe projet.