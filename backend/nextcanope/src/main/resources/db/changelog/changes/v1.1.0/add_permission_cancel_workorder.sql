INSERT INTO permissions(per_code, per_slabel, per_llabel, per_category) VALUES
('CANCEL_WORKORDER', 'Annuler une intervention', 'Annuler une intervention', 'Compte-rendu d''intervention');

INSERT INTO prf_per(prf_id, per_id)
SELECT p.id, per.id
FROM profile p, permissions per
where p.prf_code in ('ADMIN_NAT', 'ADMIN_LOC_1', 'ADMIN_LOC_2', 'MANAGER')
and per.per_code = 'CANCEL_WORKORDER';