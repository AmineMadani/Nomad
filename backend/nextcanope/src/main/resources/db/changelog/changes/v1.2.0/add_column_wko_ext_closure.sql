alter table nomad.workorder add column wko_ext_closure bool ;
comment on column nomad.workorder.wko_ext_closure is 'true if the wko was closed by an external app';