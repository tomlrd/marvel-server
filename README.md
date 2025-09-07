# Marvel Server - Backend Node.js/Express

## Architecture du Serveur

### Structure du Projet

```
marvel-server/
├── index.js                 # Point d'entrée principal
├── models/
│   └── User.js             # Modèle utilisateur MongoDB
├── routes/
│   ├── user.js             # Routes d'authentification et favoris
│   ├── characters.js       # Routes des personnages Marvel
│   └── comics.js           # Routes des comics Marvel
├── middlewares/
│   ├── isAuthenticated.js  # Middleware d'authentification
│   └── validationMiddleware.js # Gestion des erreurs de validation
└── validators/
    └── authValidators.js   # Validateurs express-validator
```

## Configuration et Démarrage

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet serveur :

```env
# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/marvel

# Port du serveur
PORT=3000

# Configuration CORS
CORS_ORIGIN=http://localhost:5173

# Clés API Marvel
MARVEL_API_KEY=xxxxxxxxxxxxxx
MARVEL_API_URI=xxxxxxxxxxx
```

### Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Démarrage en production
npm start
```

## Routes et Endpoints

### 1. Routes d'Authentification (`/user`)

#### POST `/user/signup` - Inscription

```javascript
// Body: { email: string, password: string }
// Response: { _id: string, token: string, favorites: object }
```

**Validateurs :**

- Email valide et normalisé
- Mot de passe minimum 6 caractères

**Processus :**

1. Vérification de l'unicité de l'email
2. Génération du salt et hash du mot de passe
3. Création du token unique
4. Sauvegarde en base de données
5. Retour des informations utilisateur

#### POST `/user/login` - Connexion

```javascript
// Body: { email: string, password: string }
// Response: { _id: string, token: string, favorites: object }
```

**Validateurs :**

- Email valide et normalisé
- Mot de passe requis

**Processus :**

1. Recherche de l'utilisateur par email
2. Vérification du hash du mot de passe
3. Retour des informations utilisateur

#### GET `/user/profile` - Profil Utilisateur

```javascript
// Headers: { Authorization: "Bearer <token>" }
// Response: { _id: string, email: string, favorites: object }
```

**Middleware :** `isAuthenticated`

#### POST `/user/favorites/:id` - Toggle Favori

```javascript
// Headers: { Authorization: "Bearer <token>" }
// Body: { type: "character" | "comic" }
// Response: { message: string, favorites: object }
```

**Types supportés :** `character` ou `comic`

### 2. Routes des Personnages (`/characters`)

#### GET `/characters` - Liste des Personnages

```javascript
// Query: { limit?: number, skip?: number, name?: string }
// Response: { count: number, results: array }
```

**Paramètres :**

- `limit` : Nombre d'éléments par page (défaut: 100)
- `skip` : Nombre d'éléments à ignorer (pagination)
- `name` : Recherche par nom

#### GET `/characters/:characterId` - Personnage Spécifique

```javascript
// Response: { _id: string, name: string, description: string, ... }
```

#### POST `/characters/byIds` - Personnages par IDs

```javascript
// Body: { ids: string[] }
// Response: { count: number, results: array }
```

### 3. Routes des Comics (`/comics`)

#### GET `/comics` - Liste des Comics

```javascript
// Query: { limit?: number, skip?: number, title?: string }
// Response: { count: number, results: array }
```

#### GET `/comics/comic/:comicId` - Comic Spécifique

```javascript
// Response: { _id: string, title: string, description: string, ... }
```

#### POST `/comics/byIds` - Comics par IDs

```javascript
// Body: { ids: string[] }
// Response: { count: number, results: array }
```

#### GET `/comics/:characterId` - Comics d'un Personnage

```javascript
// Response: { count: number, results: array }
```

## Middlewares

### 1. isAuthenticated.js

```javascript
const isAuthenticated = async (req, res, next) => {
  try {
    // Vérification du header Authorization
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Token manquant" });
    }

    // Extraction du token
    const token = req.headers.authorization.replace("Bearer ", "");

    // Recherche de l'utilisateur par token
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    // Ajout de l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

**Utilisation :**

- Protection des routes sensibles
- Ajout de `req.user` pour les routes protégées
- Gestion des erreurs d'authentification

### 2. validationMiddleware.js

```javascript
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
    });
  }
  next();
};
```

**Fonctionnalités :**

- Validation des données d'entrée
- Retour des erreurs de validation
- Intégration avec express-validator

## Modèles de Données

### User.js - Modèle Utilisateur

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  favorites: {
    comics: {
      type: [String],
      default: [],
    },
    characters: {
      type: [String],
      default: [],
    },
  },
  token: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});
```

**Structure des favoris :**

```javascript
favorites: {
  comics: ["comic_id_1", "comic_id_2"],
  characters: ["character_id_1", "character_id_2"]
}
```

## Système d'Authentification

### Sécurité des Mots de Passe

```javascript
// Génération du salt et hash
const salt = uid2(64);
const hash = SHA256(password + salt).toString(encBase64);
const token = uid2(64);

// Vérification lors de la connexion
const newHash = SHA256(password + user.salt).toString(encBase64);
if (newHash !== user.hash) {
  return res.status(401).json({ message: "Email ou mot de passe incorrect" });
}
```

### Gestion des Tokens

- **Génération** : Token unique de 64 caractères
- **Stockage** : En base de données avec l'utilisateur
- **Validation** : Recherche par token dans la base
- **Sécurité** : Pas d'expiration (peut être ajoutée)

## Intégration API Marvel

### Configuration

```javascript
const apiKey = process.env.MARVEL_API_KEY;
const apiUri = process.env.MARVEL_API_URI;

// Exemple d'appel
const url = `${apiUri}/characters?apiKey=${apiKey}&limit=${limit}`;
const response = await axios.get(url);
```

### Gestion des Erreurs

```javascript
try {
  const response = await axios.get(url);
  return res.status(200).json(response.data);
} catch (error) {
  console.error("Erreur API Marvel:", error.message);
  return res.status(500).json({ message: error.message });
}
```

## Configuration CORS

```javascript
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
```

## Dépendances Principales

- **Express 5.1.0** : Framework web
- **Mongoose 8.18.0** : ODM MongoDB
- **Axios 1.11.0** : Client HTTP pour l'API Marvel
- **express-validator 7.2.1** : Validation des données
- **crypto-js 4.2.0** : Hachage des mots de passe
- **uid2 1.0.0** : Génération de tokens uniques
- **cors 2.8.5** : Gestion CORS
- **dotenv 17.2.2** : Variables d'environnement

## Bonnes Pratiques Implémentées

1. **Sécurité** : Hachage des mots de passe avec salt
2. **Validation** : Validation des données d'entrée
3. **Authentification** : Middleware de protection des routes
4. **Gestion d'erreurs** : Try-catch et codes de statut appropriés
5. **Configuration** : Variables d'environnement pour la sécurité
6. **CORS** : Configuration appropriée pour le frontend
7. **Logging** : Console.log pour le debugging (à remplacer par un logger en production)
