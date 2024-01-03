alter table nomad.asset_for_sig
    rename column afs_geom to geom;

create index asset_for_sig_geom_idx
    on nomad.asset_for_sig using gist (geom);

drop index nomad.asset_for_sig_geom_idx;