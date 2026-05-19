Guide rapide — migration locale → Supabase

1) Créer la table `stages`
- Ouvrez votre projet Supabase → SQL Editor → New query.
- Collez le contenu de `db/migrations/create_tables.sql` et exécutez.

2) Exporter les données locales (dans le navigateur)
- Ouvrez `index.html` localement, ouvrez la console et collez :

```javascript
const data = localStorage.getItem('stages_data') || '[]';
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'stages_export.json'; a.click();
```

3) Migrer via l'API (Node)
- Placez `stages_export.json` dans le dossier du projet.
- Installez Node.js 18+.
- Exécutez :

```bash
SUPABASE_URL=https://tgxiylnpojyckrskocku.supabase.co \ 
SUPABASE_ANON_KEY=sb_publishable_iLfPNGKvxx_Gh2YqgG8HFg_-AD8P99P \ 
node scripts/migrate-node.js stages_export.json
```

Remarques:
- La création de la table (DDL) doit être exécutée dans le Supabase SQL Editor (ou via psql/service role). Le `anonKey` permet d'insérer des lignes si les RLS/permissions le permettent.
- Ne commitez jamais de clés privées. L'`anonKey` est conçue pour accès client limité.
