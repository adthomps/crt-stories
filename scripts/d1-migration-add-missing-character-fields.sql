-- Migration: Add missing 'bio' column to characters table
ALTER TABLE characters ADD COLUMN bio TEXT;