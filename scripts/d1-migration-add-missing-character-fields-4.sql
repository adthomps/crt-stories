-- Migration: Add missing 'portraitImage' column to characters table
ALTER TABLE characters ADD COLUMN portraitImage TEXT;