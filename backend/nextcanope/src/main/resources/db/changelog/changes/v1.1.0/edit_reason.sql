insert into workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code)
values
('Effectuer Réfection de Voirie', 'Effectuer Réfection de Voirie', '42');

insert into ast_wtr(ast_id, wtr_id )
select ast_id, wtr_id 
from (
select (select id from asset_type where ast_code = '20') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '21') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '22') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '23') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '24') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '25') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '26') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '27') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '28') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '30') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '31') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '32') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '33') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '34') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '35') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id union
select (select id from asset_type where ast_code = '38') as ast_id, (select id from workorder_task_reason where wtr_code = '42' and wtr_slabel = 'Effectuer Réfection de Voirie') as wtr_id
) as t;


insert into ast_wtr(ast_id, wtr_id )
select ast_id, wtr_id 
from (
select (select id from asset_type where ast_code = '20') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '21') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '22') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '23') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '24') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '25') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '26') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '27') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '28') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '30') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '31') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '32') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '33') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '34') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '35') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id union
select (select id from asset_type where ast_code = '38') as ast_id, (select id from workorder_task_reason where wtr_code = '40') as wtr_id
) as t;


insert into ast_wtr(ast_id, wtr_id )
select ast_id, wtr_id 
from (
select (select id from asset_type where ast_code = '20') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '21') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '22') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '23') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '24') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '25') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '26') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '27') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '28') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '30') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '31') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '32') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '33') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '34') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '35') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id union
select (select id from asset_type where ast_code = '38') as ast_id, (select id from workorder_task_reason where wtr_code = '41') as wtr_id
) as t;