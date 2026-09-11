-- Migration: Fix Admin Role
-- Description: Update admin profile role from CUSTOMER to ADMIN

UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'admin@solemate-demo.com';
