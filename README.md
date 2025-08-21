# Simulateur Solaire SunLib

Application de simulation solaire avec intégration Airtable pour la gestion des leads.

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
VITE_AIRTABLE_API_KEY=your_airtable_api_key_here
VITE_AIRTABLE_BASE_ID=your_airtable_base_id_here
```

### Configuration Airtable

1. **Créer une base Airtable** nommée "Simulateur Solaire"

2. **Créer une table** nommée "Leads Solaires" avec les champs suivants :

#### Informations Contact
- **Prénom** (Single line text)
- **Nom** (Single line text)
- **Email** (Email)
- **Téléphone** (Phone number)
- **Code postal** (Single line text)
- **Préférence contact** (Single select: Email, Téléphone)

#### Informations Adresse
- **Adresse complète** (Long text)
- **Ville** (Single line text)

#### Consommation
- **Consommation annuelle** (Number)
- **Facture mensuelle** (Number)

#### Simulation
- **Puissance recommandée** (Number)

#### Métadonnées
- **Date création** (Date)
- **Statut** (Single select: Nouveau, Contacté, Qualifié, Converti)

3. **Obtenir votre API Key** :
   - Allez sur https://airtable.com/account
   - Générez un Personal Access Token
   - Copiez la clé dans votre fichier `.env`

4. **Obtenir votre Base ID** :
   - Allez sur https://airtable.com/api
   - Sélectionnez votre base
   - L'ID de base commence par "app" et se trouve dans l'URL
   - Copiez l'ID dans votre fichier `.env`

## Installation

```bash
npm install
npm run dev
```

## Fonctionnalités

- ✅ Simulation solaire complète
- ✅ Géolocalisation automatique
- ✅ Analyse automatique de toiture
- ✅ Calculs PVGIS officiels
- ✅ Intégration Airtable pour les leads
- ✅ Interface responsive et moderne

## Structure des données envoyées à Airtable

Chaque lead contient :
- Toutes les informations de contact
- Caractéristiques détaillées de la toiture
- Données de consommation électrique
- Résultats complets de la simulation
- Métadonnées de suivi