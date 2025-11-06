-- Add USN field to proofs table
ALTER TABLE public.proofs
ADD COLUMN usn text;