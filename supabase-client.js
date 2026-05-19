/* SupabaseService
   - Initialize by placing a `supabase-config.js` exposing `window.SUPABASE_CONFIG`.
   - Requires the Supabase JS lib (CDN) to be present before this script.
*/
(function () {
    const svc = {
        client: null,
        ready: false,
        init() {
            try {
                if (!window.SUPABASE_CONFIG || !window.supabase) return;
                this.client = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
                this.ready = true;
                console.info('SupabaseService: ready');
            } catch (e) {
                console.warn('SupabaseService: init failed', e);
            }
        },
        async getAllStages() {
            const { data, error } = await this.client.from('stage').select('*').order('id', { ascending: true });
            if (error) throw error;
            return data.map(normalizeRowToStage);
        },
        async addStage(stage) {
            const row = stageToRow(stage);
            const { data, error } = await this.client.from('stage').insert([row]).select('*');
            if (error) throw error;
            return normalizeRowToStage(data[0]);
        },
        async updateStage(id, updates) {
            const row = stageToRow(updates);
            const { data, error } = await this.client.from('stage').update(row).eq('id', id).select('*');
            if (error) throw error;
            return normalizeRowToStage(data[0]);
        },
        async deleteStage(id) {
            const { error } = await this.client.from('stage').delete().eq('id', id);
            if (error) throw error;
            return true;
        },
        // Migrate localStorage data into remote DB (idempotent insert on empty table)
        async migrateLocalToRemote(localStages) {
            if (!Array.isArray(localStages) || localStages.length === 0) return { inserted: 0 };
            const rows = localStages.map(s => stageToRow(s, { keepId: false }));
            const { data, error } = await this.client.from('stage').insert(rows).select('id');
            if (error) throw error;
            return { inserted: data.length };
        }
    };

    function stageToRow(s, opts = {}) {
        const keepId = opts.keepId || false;
        const row = {
            student_name: s.student || null,
            classroom: s.classroom || null,
            company_name: s.company || null,
            email: s.contact || null,
            phone: s.phone || null,
            address: s.address || null,
            contact_mode: s.contactMode || null,
            contact_date: s.contactDate || null,
            status: s.response || null,
            reminder_date: s.remindDate || null,
            reminder_mode: s.remindMode || null,
            contact_person: s.contactPerson || null,
            notes: s.notes || null,
            convention_sent: s.convention ? !!s.convention.sent : false,
            signed_by_company: s.convention ? !!s.convention.signedByCo : false,
            signed_by_student: s.convention ? !!s.convention.signedByStudent : false,
            signed_by_school: s.convention ? !!s.convention.signedByEstablishment : false
        };
        if (keepId && s.id) row.id = s.id;
        return row;
    }

    function normalizeRowToStage(r) {
        return {
            id: r.id,
            student: r.student_name || '',
            classroom: r.classroom || '',
            company: r.company_name || '',
            contact: r.email || '',
            phone: r.phone || '',
            address: r.address || '',
            contactMode: r.contact_mode || '',
            contactDate: r.contact_date || '',
            response: r.status || '',
            remindDate: r.reminder_date || '',
            remindMode: r.reminder_mode || '',
            contactPerson: r.contact_person || '',
            notes: r.notes || '',
            convention: {
                sent: !!r.convention_sent,
                signedByCo: !!r.signed_by_company,
                signedByStudent: !!r.signed_by_student,
                signedByEstablishment: !!r.signed_by_school
            }
        };
    }

    window.SupabaseService = svc;
})();
