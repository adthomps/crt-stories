-- Migration: Add missing 'appearsInBookSlugs' column to characters table
ALTER TABLE characters ADD COLUMN appearsInBookSlugs TEXT;