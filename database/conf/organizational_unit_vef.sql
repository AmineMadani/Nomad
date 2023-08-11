\encoding UTF8

set search_path to nomad, public;

insert into  organizational_unit(org_code, org_slabel, org_llabel, out_id)
select distinct  trim(SUBSTRING(region, 1, POSITION(' ' IN region))) AS region_code,
       trim(SUBSTRING(region from POSITION(' ' IN region))) AS region_slabel,
       trim(SUBSTRING(region from POSITION(' ' IN region))) AS region_llabel,
       (select out.id from organizational_unit_type out where out.out_code = 'REGION') as out_id
FROM orga_data_tmp;

insert into  organizational_unit(org_code, org_slabel, org_llabel, out_id, org_parent_id)
select distinct  trim(SUBSTRING(tmp.territoire, 1, POSITION(' ' IN tmp.territoire))) AS territoire_code,
       trim(SUBSTRING(tmp.territoire from POSITION(' ' IN tmp.territoire))) AS tirretoire_slabel,
       trim(SUBSTRING(tmp.territoire from POSITION(' ' IN tmp.territoire))) AS tirretoire_llabel,
       (select out.id from organizational_unit_type out where out.out_code = 'TERRITOIRE') as out_id,
       (select org.id 
        from organizational_unit org 
        where org.org_code = trim(SUBSTRING(tmp.region, 1, POSITION(' ' IN tmp.region)) )
        and org.out_id = (select out.id from organizational_unit_type out where out.out_code = 'REGION')) as org_parent_id
FROM orga_data_tmp tmp;

insert  into  org_ctr (ctr_id, org_id)
select ass_ctr_id, ass_org_id
from 
(select distinct  (select ctr.id  FROM contract ctr where ctr.ctr_code = tmp.code_contrat) as ass_ctr_id ,
       (select org.id from organizational_unit org where out_id = (select out.id from organizational_unit_type out where out.out_code = 'TERRITOIRE')  
         and org.org_code = trim(SUBSTRING(tmp.territoire, 1, POSITION(' ' IN tmp.territoire)))) as ass_org_id
FROM orga_data_tmp tmp) t1
where ass_ctr_id is not null  
and ass_org_id is not null;

DROP TABLE IF EXISTS public.orga_data_tmp;