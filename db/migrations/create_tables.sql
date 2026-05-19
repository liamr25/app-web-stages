-- Migration: create tables for stages application
-- Run this in Supabase SQL editor or psql connected to your project

CREATE TABLE IF NOT EXISTS public.stages (
    id BIGSERIAL PRIMARY KEY,
    student TEXT NOT NULL,
    classroom TEXT,
    company TEXT,
    contact TEXT,
    phone TEXT,
    address TEXT,
    contact_mode TEXT,
    contact_date DATE,
    response TEXT,
    remind_date DATE,
    remind_mode TEXT,
    contact_person TEXT,
    notes TEXT,
    convention_sent BOOLEAN DEFAULT FALSE,
    convention_signed_by_co BOOLEAN DEFAULT FALSE,
    convention_signed_by_student BOOLEAN DEFAULT FALSE,
    convention_signed_by_establishment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stages_response ON public.stages (response);

CREATE INDEX IF NOT EXISTS idx_stages_student ON public.stages (lower(student));