// Exécutez ceci depuis la console du navigateur (après avoir chargé la page).
(async function migrate() {
    console.log('Migration vers Supabase: démarrage');
    if (window.StorageAdapter && typeof window.StorageAdapter.init === 'function') {
        await window.StorageAdapter.init();
    }
    if (!window.SupabaseService || !window.SupabaseService.client) {
        console.error('SupabaseService non initialisé. Vérifiez `supabase-config.js` et que la lib Supabase est chargée.');
        return;
    }

    // Vérifier que la table existe
    try {
        await window.SupabaseService.client.from('stages').select('id').limit(1);
    } catch (err) {
        console.error('Impossible d interroger la table `stages` :', err.message || err);
        console.info('Exécutez le SQL de [db/migrations/create_tables.sql](db/migrations/create_tables.sql) dans Supabase SQL Editor, puis relancez ce script.');
        return;
    }

    const local = JSON.parse(localStorage.getItem('stages_data') || '[]');
    if (!Array.isArray(local) || local.length === 0) {
        console.log('Aucune donnée locale à migrer.');
        return;
    }

    try {
        const res = await window.SupabaseService.migrateLocalToRemote(local);
        console.log('Migration terminée:', res);
        // Optionnel: supprimer les données locales
        // localStorage.removeItem('stages_data');
        // location.reload();
    } catch (e) {
        console.error('Erreur durant la migration:', e);
    }
})();
