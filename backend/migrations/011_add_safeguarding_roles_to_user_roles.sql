-- Migration 011: Add Safeguarding Roles to User Roles Check Constraint
-- Expands permitted roles in user_roles to include safeguarding_lead and safeguarding_case_review
-- Reversible rollback: Re-apply 007 constraint if required.

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
    CHECK (role IN ('user', 'helper', 'professional', 'admin', 'intern', 'safeguarding_lead', 'safeguarding_case_review'));
