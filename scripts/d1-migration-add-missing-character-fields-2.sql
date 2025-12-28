-- Migration: Add missing 'worldSlug' column to characters table
ALTER TABLE characters ADD COLUMN worldSlug TEXT;