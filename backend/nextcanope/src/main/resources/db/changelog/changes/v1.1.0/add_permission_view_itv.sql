INSERT INTO permissions(per_code, per_slabel, per_llabel, per_category) VALUES
    ('VIEW_ITV', 'Visualisation et importation d''ITV', 'Visualisation et importation d''ITV', 'Visualisation ITV');

INSERT INTO prf_per(prf_id, per_id)
SELECT p.id, per.id
FROM profile p, permissions per
where p.prf_code in ('ADMIN_NAT', 'ADMIN_LOC_1', 'ADMIN_LOC_2', 'MANAGER', 'DESKTOP_AGENT')
  and per.per_code = 'VIEW_ITV';