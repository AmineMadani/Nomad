
alter table exploitation.workorder add constraint  fk_wko_wtt_id	  foreign key (wtt_id) references exploitation.workorder_task_type ( id);	          
alter table exploitation.workorder add constraint  fk_wko_wtr_id      foreign key (wtr_id ) references exploitation.workorder_task_reason ( id);         	  
alter table exploitation.workorder add constraint  fk_wko_wts_id      foreign key (wts_id ) references exploitation.workorder_task_status ( id);             
alter table exploitation.workorder add constraint  fk_wko_wko_ucre_id foreign key (wko_ucre_id ) references exploitation.user ( id);       
alter table exploitation.workorder add constraint  fk_wko_wko_umod_id foreign key (wko_umod_id ) references exploitation.user ( id);            
alter table exploitation.workorder add constraint  fk_wko_str_id      foreign key (str_id) references exploitation.workorder_task_status ( id);              
alter table exploitation.workorder add constraint  fk_wko_ctr_id      foreign key (ctr_id) references exploitation.contract ( id);               

alter table exploitation.task add constraint fk_tsk_wko_id		            foreign key(wko_id) references exploitation.workorder ( id);	         
alter table exploitation.task add constraint fk_tsk_wtt_id		            foreign key(wtt_id) references exploitation.workorder_task_type ( id);	         
alter table exploitation.task add constraint fk_tsk_wtr_id         	        foreign key(wtr_id) references exploitation.workorder_task_reason ( id);       	     
alter table exploitation.task add constraint fk_tsk_wts_id                  foreign key(wts_id) references exploitation.workorder_task_status ( id);              
alter table exploitation.task add constraint fk_tsk_ctr_id                  foreign key(ctr_id) references exploitation.contract ( id);              
alter table exploitation.task add constraint fk_tsk_tsk_realization_user    foreign key(tsk_realization_user) references exploitation.user ( id);
alter table exploitation.task add constraint fk_tsk_ass_id             foreign key(ass_id) references exploitation.asset ( id); 

alter table exploitation.task add constraint fk_tsk_tsk_ucre_id             foreign key(tsk_ucre_id) references exploitation.user ( id);
alter table exploitation.task add constraint fk_tsk_tsk_umod_id             foreign key(tsk_umod_id) references exploitation.user ( id); 

alter table exploitation.workorder_task_status add constraint fk_wts_wts_ucre_id  foreign key (wts_ucre_id) references exploitation.user ( id);      
alter table exploitation.workorder_task_status add constraint fk_wts_wts_umod_id  foreign key (wts_umod_id) references exploitation.user ( id);  

alter table exploitation.workorder_task_type add constraint fk_wtt_wtt_ucre_id   foreign key (wtt_ucre_id ) references exploitation.user ( id); 
alter table exploitation.workorder_task_type add constraint fk_wtt_wtt_umod_id   foreign key (wtt_umod_id ) references exploitation.user ( id); 
alter table exploitation.workorder_task_type add constraint fk_wtt_act_id       foreign key (act_id) references exploitation.activity ( id); 

alter table exploitation.workorder_task_reason add constraint fk_wtr_wtr_ucre_id   foreign key (wtr_ucre_id) references exploitation.user ( id); 
alter table exploitation.workorder_task_reason add constraint fk_wtr_wtr_umod_id   foreign key (wtr_umod_id) references exploitation.user ( id); 

alter table exploitation.contract add constraint fk_ctr_ctr_ucre_id  foreign key (ctr_ucre_id) references exploitation.user ( id); 
alter table exploitation.contract add constraint fk_ctr_ctr_umod_id  foreign key (ctr_umod_id) references exploitation.user ( id); 
alter table exploitation.contract add constraint fk_ctr_act_id       foreign key (act_id) references exploitation.activity ( id); 

alter table exploitation.activity add constraint fk_act_act_ucre_id  foreign key (act_ucre_id) references exploitation.user ( id); 
alter table exploitation.activity add constraint fk_act_act_umod_id  foreign key (act_umod_id) references exploitation.user ( id); 

alter table exploitation.street add constraint fk_str_str_ucre_id   foreign key (str_ucre_id) references exploitation.user ( id); 
alter table exploitation.street add constraint fk_str_str_umod_id   foreign key (str_umod_id) references exploitation.user ( id); 

alter table exploitation.wtt_wtr add constraint fk_wtx_wtr_id      	 foreign key (wtr_id) references exploitation.workorder_task_reason ( id); 
alter table exploitation.wtt_wtr add constraint fk_wtx_wtt_id	   	 foreign key (wtt_id) references exploitation.workorder_task_type ( id); 
alter table exploitation.wtt_wtr add constraint fk_wtx_wtx_ucre_id 	 foreign key (wtx_ucre_id) references exploitation.user ( id); 
alter table exploitation.wtt_wtr add constraint fk_wtx_wtx_umod_id 	 foreign key (wtx_umod_id) references exploitation.user ( id); 


alter table exploitation.asset add constraint fk_ass_ass_ucre_id 	foreign key (ass_umod_id) references exploitation.user ( id);
alter table exploitation.asset add constraint fk_ass_ass_umod_id 	foreign key (ass_umod_id) references exploitation.user ( id);


alter table exploitation.report add constraint fk_rpt_tsk_id	    foreign key (tsk_id) references exploitation.task ( id);
alter table exploitation.report add constraint fk_rpt_rpt_ucre_id 	foreign key (rpt_umod_id) references exploitation.user ( id);
alter table exploitation.report add constraint fk_rpt_rpt_umod_id 	foreign key (rpt_umod_id) references exploitation.user ( id);


alter table exploitation.report_detail add constraint fk_rpd_rpt_id 	foreign key (rpt_id) references exploitation.report ( id);
alter table exploitation.report_detail add constraint fk_rpd_rpf_id 	foreign key (rpf_id) references exploitation.report_field ( id);
alter table exploitation.report_detail add constraint fk_rpd_rpd_ucre_id 	foreign key (rpd_ucre_id) references exploitation.user ( id);
alter table exploitation.report_detail add constraint fk_rpd_rpd_umod_id 	foreign key (rpd_umod_id) references exploitation.user ( id);

alter table exploitation.report_field add constraint fk_rpf_rpf_ucre_id 	foreign key (rpf_ucre_id) references exploitation.user ( id);
alter table exploitation.report_field add constraint fk_rpf_rpf_umod_id 	foreign key (rpf_umod_id) references exploitation.user ( id);

