---------------------------------------------
-- Creation of workorder table
---------------------------------------------
/*
COMMENT ON TABLE exploitation.intervention IS 'This table lists up all the intervention';
COMMENT ON COLUMN exploitation.intervention.id IS 'Table unique ID';
*/

/*
create table if not exists exploitation.user(
id                           bigserial primary key,
usr_first_name               text,
usr_last_name	        	 text,
usr_email	        	     text,
usr_valid                    boolean default true,
usr_ucre_id                  bigint default 0,
usr_umod_id                  bigint default 0,
usr_dcre                     timestamp without time zone  default current_timestamp,
usr_dmod                     timestamp without time zone  default current_timestamp
);


create unique index if not exists idx_usr_usr_email    on exploitation.user(usr_email);
create index if not exists idx_usr_usr_ucre_id on exploitation.user(usr_ucre_id);
create index if not exists idx_usr_usr_umod_id on exploitation.user(usr_umod_id);
*/


create table if not exists exploitation.workorder(
id                           bigserial primary key,
-- Work order properties
wko_name                     text,
wko_external_app	         text,
wko_external_id	             text,
wko_dcre        	         timestamp without time zone  default current_timestamp,
wko_creation_cell            text,
wko_creation_comment         text,
wko_emergency                char,
wko_appointment              char,
wko_dmod                     timestamp without time zone  default current_timestamp,
wko_address                  text,
wko_street_number            text,
wko_planning_start_date      timestamp without time zone,
wko_planning_end_date	     timestamp without time zone,
wko_completion_date	         timestamp without time zone,
wko_realization_user         text,
wko_realization_cell         text,
wko_realization_comment      text,
------
usr_ucre_id                  integer references user(id),
usr_umod_id                  integer references user(id),
wko_dcre        	         timestamp without time zone  default current_timestamp,
wko_dmod                     timestamp without time zone  default current_timestamp,

-------
city_code                    text,
city_name                    text,

wtt_id                       bigint,
wtr_id                       bigint,

wts_id                       bigint,

str_id                       bigint,

ctr_id                       bigint,

water_stop_id                bigint,
program_id                   bigint,
worksite_id                  bigint,
delivery_point_id            bigint,

longitude                    numeric,
latitude                     numeric,
geom                         geometry('POINT', :srid)
);


create index if not exists idx_wko_wtt_id		         on exploitation.workorder(wtt_id	);
create index if not exists idx_wko_wtr_id           	 on exploitation.workorder(wtr_id );
create index if not exists idx_wko_wts_id                on exploitation.workorder(wts_id );
create index if not exists idx_wko_wko_ucre_id           on exploitation.workorder(wko_ucre_id );
create index if not exists idx_wko_wko_umod_id           on exploitation.workorder(wko_umod_id );
create index if not exists idx_wko_wko_city_insee_number      on exploitation.workorder(wko_city_insee_number);
create index if not exists idx_wko_str_id                on exploitation.workorder(str_id);
create index if not exists idx_wko_ctr_id                on exploitation.workorder(ctr_id);
create index if not exists idx_wko_water_cut_id          on exploitation.workorder(water_cut_id);
create index if not exists idx_wko_program_id            on exploitation.workorder(program_id);
create index if not exists idx_wko_worksite_id           on exploitation.workorder(worksite_id );
create index if not exists idx_wko_delivery_point_id     on exploitation.workorder(delivery_point_id);
create index if not exists idx_wko_wko_geometry          on exploitation.workorder USING gist(wko_geometry);


create table if not exists exploitation.task(
id                           bigserial primary key,
tsk_name                     text,
wko_id		                 bigint,
wtt_id		                 bigint,
wtr_id         	             bigint,
wts_id                       bigint,
tsk_comment                  text,
tsk_longitude                numeric,
tsk_latitude                 numeric,
ctr_id                       bigint,
ass_id                       bigint,
tsk_planning_start_date	     timestamp without time zone,
tsk_planning_end_date	     timestamp without time zone,
tsk_completion_date	         timestamp without time zone,
tsk_realization_user         bigint,
usr_ucre_id                  integer references user(id),
usr_umod_id                  integer references user(id),
tsk_dcre        	         timestamp without time zone  default current_timestamp,
tsk_dmod                     timestamp without time zone  default current_timestamp,
geom                         geometry('POINT', :srid)
);


create index if not exists idx_tsk_wko_id		          on exploitation.task(wko_id);
create index if not exists idx_tsk_wtt_id		          on exploitation.task(wtt_id);
create index if not exists idx_tsk_wtr_id         	      on exploitation.task(wtr_id);
create index if not exists idx_tsk_wts_id                 on exploitation.task(wts_id);
create index if not exists idx_tsk_ctr_id                 on exploitation.task(ctr_id);
create index if not exists idx_tsk_tsk_realization_user   on exploitation.task(tsk_realization_user);
create index if not exists idx_tsk_tsk_ucre_id            on exploitation.task(tsk_ucre_id);
create index if not exists idx_tsk_tsk_umod_id            on exploitation.task(tsk_umod_id);
create index if not exists idx_tsk_ass_id		          on exploitation.task(ass_id);


create table if not exists exploitation.workorder_task_status(
id                           bigserial primary key,
wts_code                     text,
wts_slabel	        	     text,
wts_llabel	        	     text,
wts_wo     	  	             boolean default true,
wts_task     	  	         boolean default true,
wts_valid                    boolean default true,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
wts_dcre                     timestamp without time zone  default current_timestamp,
wts_dmod                     timestamp without time zone  default current_timestamp
);



create unique index if not exists idx_wts_wts_code  on exploitation.workorder_task_status(wts_code);
create index if not exists idx_wts_wts_ucre_id      on exploitation.workorder_task_status(wts_ucre_id);
create index if not exists idx_wts_wts_umod_id      on exploitation.workorder_task_status(wts_umod_id);



create table if not exists exploitation.workorder_task_type(
id                           bigserial primary key,
wtt_code                     text,
wtt_slabel	        	     text,
wtt_llabel	        	     text,
wtt_valid                    boolean default true,
wtt_work_request             boolean default true,
wtt_report                   boolean default true,
wtr_wo     	  	             boolean default true,
wtr_task     	  	         boolean default true,
act_id                       bigint,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
wtt_dcre                     timestamp without time zone  default current_timestamp,
wtt_dmod                     timestamp without time zone  default current_timestamp
);


create unique index if not exists idx_wtt_wtt_code   on exploitation.workorder_task_type(wtt_code );
create index if not exists idx_wtt_act_id      	on exploitation.workorder_task_type(act_id);
create index if not exists idx_wtt_wtt_ucre_id  	 on exploitation.workorder_task_type(wtt_ucre_id );
create index if not exists idx_wtt_wtt_umod_id  	 on exploitation.workorder_task_type(wtt_umod_id );


create table if not exists exploitation.workorder_task_reason
(
id                           bigserial primary key,
wtr_code                     text,
wtr_slabel	        	     text,
wtr_llabel	        	     text,
wtr_valid                    boolean default true,
wtr_work_request             boolean default true,
wtr_report                   boolean default true,
wtr_wo     	  	             boolean default true,
wtr_task     	  	         boolean default true,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
wtr_dcre                     timestamp without time zone  default current_timestamp,
wtr_dmod                     timestamp without time zone  default current_timestamp
);


create unique index if not exists idx_wtr_wtr_code     	on exploitation.workorder_task_reason(wtr_code);
create index if not exists idx_wtr_wtr_ucre_id  	on exploitation.workorder_task_reason(wtr_ucre_id);
create index if not exists idx_wtr_wtr_umod_id  	on exploitation.workorder_task_reason(wtr_umod_id);



create table if not exists exploitation.contract(
id                           bigserial primary key,
ctr_code                     text,
ctr_slabel	        	     text,
ctr_llabel	        	     text,
ctr_valid                    boolean default true,
ctr_start_date               timestamp without time zone,
ctr_end_date                 timestamp without time zone,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
ctr_dcre                     timestamp without time zone  default current_timestamp,
ctr_dmod                     timestamp without time zone  default current_timestamp,
act_id                       bigint
);


create unique index if not exists idx_ctr_ctr_code    	on exploitation.contract(ctr_code);
create index if not exists idx_ctr_ctr_ucre_id 	on exploitation.contract(ctr_ucre_id);
create index if not exists idx_ctr_ctr_umod_id 	on exploitation.contract(ctr_umod_id);
create index if not exists idx_ctr_act_id      	on exploitation.contract(act_id);




create table if not exists exploitation.activity(
id                           bigserial primary key,
act_code                     text,
act_slabel	        	     text,
act_llabel	        	     text,
act_valid                    boolean default true,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
act_dcre                     timestamp without time zone  default current_timestamp,
act_dmod                     timestamp without time zone  default current_timestamp
);


create unique index if not exists idx_act_act_code    on exploitation.activity(act_code);
create index if not exists idx_act_act_ucre_id on exploitation.activity(act_ucre_id);
create index if not exists idx_act_act_umod_id on exploitation.activity(act_umod_id);




create table if not exists exploitation.street(
id                           bigserial primary key,
str_code                     text,
str_slabel	        	     text,
str_llabel	        	     text,
str_source	        	     text,
str_valid                    boolean default true,
geom                         geometry(multilinestring, :srid),
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
str_dcre                     timestamp without time zone  default current_timestamp,
str_dmod                     timestamp without time zone  default current_timestamp
);



create unique index if not exists idx_str_str_code     	on exploitation.street(str_code);
create index if not exists idx_str_str_geometry 	on exploitation.street USING gist(str_geometry);
create index if not exists idx_str_str_ucre_id  	on exploitation.street(str_ucre_id);
create index if not exists idx_str_str_umod_id  	on exploitation.street(str_umod_id);



create table if not exists exploitation.wtt_wtr(
wtr_id                       bigint,
wtt_id	        	         bigint,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
wtx_dcre                     timestamp without time zone  default current_timestamp,
wtx_dmod                     timestamp without time zone  default current_timestamp,
primary key (wtr_id, wtt_id)
);


create index if not exists idx_wtx_wtr_id      	on exploitation.wtt_wtr(wtr_id);
create index if not exists idx_wtx_wtt_id	   	on exploitation.wtt_wtr(wtt_id);
create index if not exists idx_wtx_wtx_ucre_id 	on exploitation.wtt_wtr(wtx_ucre_id);
create index if not exists idx_wtx_wtx_umod_id 	on exploitation.wtt_wtr(wtx_umod_id);



create table if not exists exploitation.asset(
id                           bigserial primary key,
ass_obj_ref                  text,
ass_obj_table                regclass NOT NULL REFERENCES config.layer(pg_table),
ass_valid                    boolean default true,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
ass_dcre                     timestamp without time zone  default current_timestamp,
ass_dmod                     timestamp without time zone  default current_timestamp
);

create index if not exists idx_ass_ass_obj_ref	   	on exploitation.asset(ass_obj_ref);
create index if not exists idx_ass_ass_ucre_id 	on exploitation.asset(ass_ucre_id);
create index if not exists idx_ass_ass_umod_id 	on exploitation.asset(ass_umod_id);



create table if not exists exploitation.report(
id                           bigserial primary key,
tsk_id                       bigint,
rpt_report_date              timestamp without time zone  default current_timestamp,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
rpt_dcre                     timestamp without time zone  default current_timestamp,
rpt_dmod                     timestamp without time zone  default current_timestamp
);


create index if not exists idx_rpt_tsk_id	    on exploitation.report(tsk_id);
create index if not exists idx_rpt_rpt_ucre_id 	on exploitation.report(rpt_ucre_id);
create index if not exists idx_rpt_rpt_umod_id 	on exploitation.report(rpt_umod_id);



create table if not exists exploitation.report_detail(
id                           bigserial primary key,
rpt_id                       bigint,
rpf_id                       bigint,
rpd_value                    text,
ucre_id                      integer references user(id),
umod_id                      integer references user(id),
rpd_dcre                     timestamp without time zone  default current_timestamp,
rpd_dmod                     timestamp without time zone  default current_timestamp
);

create index if not exists idx_rpd_rpt_id	    on exploitation.report_detail(rpt_id);
create index if not exists idx_rpd_rpf_id	    on exploitation.report_detail(rpf_id);
create index if not exists idx_rpd_rpd_ucre_id 	on exploitation.report_detail(rpd_ucre_id);
create index if not exists idx_rpd_rpd_umod_id 	on exploitation.report_detail(rpd_umod_id);




create table if not exists exploitation.report_field(
id                           bigserial primary key, -- Report field technical id
rpf_code                     text, -- Report field code
rpf_slabel	        	     text,-- Report field short label
rpf_llabel	        	     text,-- Report field long label
rpf_valid                    boolean default true, -- Validity
ucre_id                      integer references user(id), -- creation user id
umod_id                      integer references user(id),-- update user id
rpf_dcre                     timestamp without time zone  default current_timestamp,
rpf_dmod                     timestamp without time zone  default current_timestamp
);

create unique index if not exists idx_rpf_rpf_code    	on exploitation.report_field(rpf_code);
create index if not exists idx_rpf_rpf_ucre_id 	        on exploitation.report_field(rpf_ucre_id);
create index if not exists idx_rpf_rpf_umod_id 	        on exploitation.report_field(rpf_umod_id);
