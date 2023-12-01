INSERT INTO
    permissions(per_code, per_slabel, per_llabel, per_category)
VALUES (
    'VIEW_TECHNICAL_LAYER_REFERENCES',
    'Visualiser les références de couche technique',
    'Visualiser les références de couche technique',
    'Paramétrage'
 );

INSERT INTO
    prf_per(prf_id, per_id)
VALUES (
    (select prf.id from profile prf where prf.prf_code = 'ADMIN_NAT'),
    (select per.id from permissions per where per.per_code = 'VIEW_TECHNICAL_LAYER_REFERENCES')
 )