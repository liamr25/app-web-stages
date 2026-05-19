/* StorageAdapter
   - Uses SupabaseService when available, otherwise falls back to localStorage.
   - Provides the same API (`getAllStages`, `addStage`, `updateStage`, `deleteStage`, `clearAllData`)
     so `app.js` code can keep working with minimal changes.
*/
(function () {
    const STORAGE_KEY = 'stages_data';

    const adapter = {
        isRemote: false,
        async init() {
            if (window.SupabaseService && typeof window.SupabaseService.init === 'function') {
                try {
                    window.SupabaseService.init();
                    if (window.SupabaseService.ready) {
                        this.isRemote = true;
                        console.info('StorageAdapter: using Supabase remote storage');
                        return;
                    }
                } catch (e) {
                    console.warn('StorageAdapter: Supabase init failed', e);
                }
            }
            this.isRemote = false;
            console.info('StorageAdapter: using localStorage fallback');
        },
        async getAllStages() {
            if (this.isRemote) {
                return await window.SupabaseService.getAllStages();
            }
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        },
        async saveStages(stages) {
            if (this.isRemote) {
                // naive approach: update rows individually
                for (const s of stages) {
                    if (s.id) {
                        await window.SupabaseService.updateStage(s.id, s).catch(() => { });
                    } else {
                        await window.SupabaseService.addStage(s).catch(() => { });
                    }
                }
                return;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
        },
        async addStage(stage) {
            if (this.isRemote) {
                return await window.SupabaseService.addStage(stage);
            }
            const stages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            stage.id = Math.max(...stages.map(s => s.id), 0) + 1;
            stages.push(stage);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
            return stage;
        },
        async updateStage(id, updates) {
            if (this.isRemote) {
                return await window.SupabaseService.updateStage(id, updates);
            }
            const stages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const index = stages.findIndex(s => s.id === id);
            if (index !== -1) {
                stages[index] = { ...stages[index], ...updates };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
                return stages[index];
            }
            return null;
        },
        async deleteStage(id) {
            if (this.isRemote) {
                return await window.SupabaseService.deleteStage(id);
            }
            const stages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').filter(s => s.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
            return true;
        },
        async clearAllData() {
            if (this.isRemote) {
                // caution: this will delete all rows from stages
                await window.SupabaseService.client.from('stage').delete().neq('id', 0).catch(() => { });
                return;
            }
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    window.StorageAdapter = adapter;
})();
