#!/usr/bin/env node
// Node script pour migrer un fichier JSON d'export local vers Supabase via REST
// Usage:
// SUPABASE_URL=https://<project>.supabase.co SUPABASE_ANON_KEY=sb_... node migrate-node.js stages_export.json

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
    console.error('Définissez SUPABASE_URL et SUPABASE_ANON_KEY en variables d environnement.');
    process.exit(1);
}

const file = process.argv[2] || 'stages_export.json';
if (!fs.existsSync(file)) {
    console.error('Fichier introuvable:', file);
    process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');
let stages;
try {
    stages = JSON.parse(raw);
} catch (e) {
    console.error('Erreur JSON:', e.message);
    process.exit(1);
}

function toRow(s) {
    return {
        student: s.student || null,
        classroom: s.classroom || null,
        company: s.company || null,
        contact: s.contact || null,
        phone: s.phone || null,
        address: s.address || null,
        contact_mode: s.contactMode || null,
        contact_date: s.contactDate || null,
        response: s.response || null,
        remind_date: s.remindDate || null,
        remind_mode: s.remindMode || null,
        contact_person: s.contactPerson || null,
        notes: s.notes || null,
        convention_sent: s.convention ? !!s.convention.sent : false,
        convention_signed_by_co: s.convention ? !!s.convention.signedByCo : false,
        convention_signed_by_student: s.convention ? !!s.convention.signedByStudent : false,
        convention_signed_by_establishment: s.convention ? !!s.convention.signedByEstablishment : false
    };
}

(async () => {
    const rows = stages.map(toRow);
    const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/stages`;

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(rows)
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('Erreur API:', res.status, text);
        process.exit(1);
    }
    const data = await res.json();
    console.log('Import réussi, lignes insérées:', Array.isArray(data) ? data.length : 1);
})();
