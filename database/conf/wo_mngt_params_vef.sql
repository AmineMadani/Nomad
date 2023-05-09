insert into exploitation.user(id, usr_first_name, usr_last_name, usr_email ) values (0, 'tech', 'NOMAD', 'tech.nomad@veolia.com');


insert into exploitation.activity(act_code, act_slabel, act_llabel ) values ('ASST','Assainissement','Assainissement');
insert into exploitation.activity(act_code, act_slabel, act_llabel ) values ('AEP','Eau','Eau');
insert into exploitation.activity(act_code, act_slabel, act_llabel ) values ('MIXTE','Mixte','Mixte');
insert into exploitation.activity(act_code, act_slabel, act_llabel ) values ('TRAVAUX','Travaux','Travaux');


insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Canalisation','Canalisation','20',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Branchement AEP','Branchement AEP','21',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Ouvrage AEP','Ouvrage AEP','22',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Vanne','Vanne','23',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Equipement Incendie','Equipement Incendie','24',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Equipement de Comptage','Equipement de Comptage','25',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Autre Equipement AEP','Autre Equipement AEP','26',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Equipement de Régulation','Equipement de Régulation','27',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('X, Y, Adresse AEP','X, Y, Adresse AEP','29',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Collecteur','Collecteur','30',(select act.id from exploitation.activity act where act.act_code = 'ASST'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Branchement ASST','Branchement ASST','31',(select act.id from exploitation.activity act where act.act_code = 'ASST'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Ouvrage ASST','Ouvrage ASST','32',(select act.id from exploitation.activity act where act.act_code = 'ASST'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Avaloir','Avaloir','33',(select act.id from exploitation.activity act where act.act_code = 'ASST'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Regard','Regard','34',(select act.id from exploitation.activity act where act.act_code = 'ASST'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Autre Equipement ASST','Autre Equipement ASST','35',(select act.id from exploitation.activity act where act.act_code = 'ASST'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('X, Y, Adresse ASST','X, Y, Adresse ASST','39',(select act.id from exploitation.activity act where act.act_code = 'ASST'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Multi-patrimoine AEP','Multi-patrimoine AEP','28',(select act.id from exploitation.activity act where act.act_code = 'AEP'));

insert into exploitation.workorder_task_type(wtt_slabel,wtt_llabel,wtt_code,act_id) values 
('Multi-patrimoine ASST','Multi-patrimoine ASST','38',(select act.id from exploitation.activity act where act.act_code = 'ASST'));



insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Poser', 'Poser', '10');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Raccorder', 'Raccorder', '11');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Renouveler', 'Renouveler', '12');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Réaliser un Métré', 'Réaliser un Métré', '13');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Mettre hors service', 'Mettre hors service', '14');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Entretenir / Réparer (hors fuite)', 'Entretenir / Réparer (hors fuite)', '15');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Entretenir / Réparer', 'Entretenir / Réparer', '15');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Contrôler', 'Contrôler', '16');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Manoeuvrer', 'Manoeuvrer', '16');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Contrôler / Enquêter', 'Contrôler / Enquêter', '16');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Relever / Vérifier', 'Relever / Vérifier', '16');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Entretenir / Réparer BAC ou Fontes de Voirie', 'Entretenir / Réparer BAC ou Fontes de Voirie', '17');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Repérer / Enquêter sur X,Y', 'Repérer / Enquêter sur X,Y', '19');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Rechercher Fuite', 'Rechercher Fuite', '20');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Réparer Fuite', 'Réparer Fuite', '21');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Purger', 'Purger', '22');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Nettoyer', 'Nettoyer', '23');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Informe Arrêt d''Eau', 'Informe Arrêt d''Eau', '28');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Exécuter un arrêt ou une remise en eau', 'Exécuter un arrêt ou une remise en eau', '29');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Curer', 'Curer', '30');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Désobstruer', 'Désobstruer', '31');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Pomper Vidanger', 'Pomper Vidanger', '32');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Détruire nuisible', 'Détruire nuisible', '33');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Réaliser une ITV', 'Réaliser une ITV', '34');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Réhabiliter', 'Réhabiliter', '35');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Test à la fumée', 'Test à la fumée', '36');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Terrasser', 'Terrasser', '40');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Effectuer un remblais', 'Effectuer un remblais', '41');
insert into exploitation.workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code) values ('Effectuer Réfection de Voirie X,Y', 'Effectuer Réfection de Voirie X,Y', '42');




insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '11'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '14'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '20'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '20'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '22'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '21'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '21'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '21'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '14'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '21'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '21'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '22'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '23'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '11'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '14'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '17'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '23'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '24'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '24'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '11'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '24'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '24'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '14'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '24'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '24'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '24'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '25'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '25'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '25'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '25'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '25'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '17'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '25'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '11'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '14'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '17'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '26'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '27'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '27'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '11'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '27'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '27'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '14'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '27'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '27'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '17'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '27'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '13'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '19'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '20'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '21'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '28'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '29'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '40'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '41'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '29'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '42'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '30'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '31'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '32'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '34'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '35'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '30'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '36'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '30'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '31'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '32'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '31'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '34'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '32'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '32'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '30'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '32'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '31'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '32'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '32'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '17'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '30'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '31'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '33'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '32'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '17'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '30'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '31'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '32'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '34'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '33'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '35'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '10'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '35'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '12'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '35'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '15'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '35'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '35'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '17'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '39'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '13'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '39'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '16'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '39'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '32'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '39'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '40'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '39'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '41'));
insert into exploitation.wtt_wtr(wtt_id, wtr_id) values ((select wtt.id from exploitation.workorder_task_type wtt where wtt.wtt_code = '39'), (select wtr.id from exploitation.workorder_task_reason wtr where wtr.wtr_code = '42'));


insert into exploitation.workorder_task_status( wts_code, wts_slabel, wts_llabel) values ('CREE','créé','créé');
insert into exploitation.workorder_task_status( wts_code, wts_slabel, wts_llabel) values ('ENVOYEPLANIF','envoyé à la planification','envoyé à la planification');
insert into exploitation.workorder_task_status( wts_code, wts_slabel, wts_llabel) values ('PLANIFIE','planifié','planifié');
insert into exploitation.workorder_task_status( wts_code, wts_slabel, wts_llabel) values ('TERMINE','terminé','terminé');
insert into exploitation.workorder_task_status( wts_code, wts_slabel, wts_llabel) values ('ANNULE','annulé','annulé');


