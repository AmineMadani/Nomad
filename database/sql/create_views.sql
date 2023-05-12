set search_path to nomad, public;

-- Create view to generate simplified layer tree
-- Use config table that gives for each domain
-- the associated tabs and its layers
create or replace view v_simplified_layer_tree as
with recursive doms as
 (
 SELECT id, dom_alias as parent_domain_alias, dom_type as domain_type, dom_alias as tab
   FROM domains
  where dom_parent_id is null
  union all
 select d1.id as id, d2.parent_domain_alias, d1.dom_type as domain_type, d1.dom_alias as tab
   from doms d2
   join domains d1
     on d1.dom_parent_id = d2.id
)
   select d.parent_domain_alias, d.tab, t.tre_slabel as tree_group,l.*
     from layer l
left join doms d on d.id = l.dom_id
left join tree t on t.id = l.tre_simplified_group_id
 order by l.lyr_num_order;

-- Create view to generate detailed layer tree
-- Use config table that gives for each domain
-- the associated layers group by group
create or replace view v_detailed_layer_tree as
with
toc as
(
with recursive tree_orga as
  (
  SELECT id,  id  as parent, dom_id, tre_num_order as num_order , tre_slabel as parent_tree_group , tre_slabel as tree_group
   FROM tree
  where tre_parent_id is null
  union all
  select lg.id, parent, lg.dom_id, lg.tre_num_order, parent_tree_group, lg.tre_slabel as tree_group
   from tree_orga g
   join tree lg
     on lg.tre_parent_id = g.id
  )
  select * from tree_orga
),
doms as
(
  with recursive doms as
  (
 SELECT id, dom_alias as parent_domain_alias, dom_type as domain_type, dom_alias as tab
   FROM domains
  where dom_parent_id is null
  union all
 select d1.id as id, d2.parent_domain_alias, d1.dom_type as domain_type, d1.dom_alias as tab
   from doms d2
   join domains d1
     on d1.dom_parent_id = d2.id
  )
  select * from doms
)
    select d.parent_domain_alias,  t.parent_tree_group, t.tree_group, l.*
      from layer l
 left join doms d on d.id = l.dom_id
 left join toc t on t.id = l.tre_group_id
  order by l.id;

-- Create view to generate for each layer
-- the list of workorder reason
create or replace view v_layer_wtr as
   select t1.ast_code, lyr_table_name, t2.*
     from asset_type t1
     join ast_wtr t2 on t1.id =  t2.ast_id
left join layer l on l.ast_id = t1.id