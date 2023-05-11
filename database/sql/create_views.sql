set search_path to nomad, public;

-- Create view to generate simplified layer tree
-- Use config table that gives for each domain
-- the associated tabs and its layers
create or replace view v_simplified_layer_tree as
with recursive domains as
 (
 SELECT type as parent_domain_type, alias as parent_domain_alias, type as domain_type, alias as tab
   FROM domain
  where parent_type is null
  union all
 select d1.parent_type as parent_domain_type, d2.parent_domain_alias, d1.type as domain_type, d1.alias as tab
   from domains d2
   join domain d1
     on d1.parent_type = d2.domain_type
)
   select d.parent_domain_type, d.parent_domain_alias, d.tab, t.alias as tree_group,l.*
     from layer l
left join domains d on d.domain_type = l.domain_type
left join tree t on t.id = l.simplified_tree_group_id
 order by l.num_order;

-- Create view to generate detailed layer tree
-- Use config table that gives for each domain
-- the associated layers group by group
create or replace view v_detailed_layer_tree as
with
toc as
(
with recursive tree_orga as
  (
  SELECT id,  id  as parent, domain_type, num_order as num_order , alias as parent_tree_group , alias as tree_group
   FROM tree
  where parent_id is null
  union all
  select lg.id, parent, lg.domain_type, lg.num_order, parent_tree_group, lg.alias as tree_group
   from tree_orga g
   join tree lg
     on lg.parent_id = g.id
  )
  select * from tree_orga
),
domains as
(
  with recursive domains as
  (
  SELECT type as parent_domain_type, alias as parent_domain_alias, type as domain_type, alias as tab
   FROM domain
  where parent_type is null
  union all
  select d1.parent_type as parent_domain_type, d2.parent_domain_alias, d1.type as domain_type, d1.alias as tab
   from domains d2
   join domain d1
     on d1.parent_type = d2.domain_type
  )
  select * from domains
)
    select d.parent_domain_type, d.parent_domain_alias,  t.parent_tree_group, t.tree_group, l.*
      from layer l
 left join domains d on d.domain_type = l.domain_type
 left join toc t on t.id = l.tree_group_id
  order by l.num_order;

-- Create view to generate for each layer
-- the list of workorder reason
create or replace view v_layer_wtr as
   select t1.domain_type, lyr_table_name, t2.*
     from asset_type t1
     join asset_type_wtr t2 on t1.code =  t2.asset_type
left join layer l on l.asset_type = t1.code
