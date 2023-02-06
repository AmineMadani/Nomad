/**************************
 * Create settings for APP *
 **************************/

set search_path to settings, public;

create table float_setting (
    name text primary key
  , value double precision
);

create table text_setting (
    name text primary key
  , value text
);

--
-- Get the current value of the given float setting name.
-- By default, it looks for the parameter in the float_settings table.
-- But the setting can be overriden by a SET command in the current session.
create or replace function current_float(setting text) returns double precision
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return current_setting(setting);
exception when others then
  return (select value from settings.float_setting where name=setting);
end;
$$;

--
-- Get the current value of the given text setting name.
-- By default, it looks for the parameter in the text_settings table.
-- But the setting can be overriden by a SET command in the current session.
create or replace function current_text(setting text) returns text
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return (select value from settings.text_setting where name=setting);
end;
$$;

--
-- Get the current version of product
create or replace function get_product_version() returns text
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return (select settings.current_text('product.version'));
end;
$$;


--
-- Get the current srid
create or replace function get_srid() returns integer
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return (select settings.current_text('srid')::integer);
end;
$$;
--
-- Set the current version of product
create or replace function set_product_version(version text) returns void
language plpgsql
as
$$
begin
  insert into settings.text_setting values ('product.version', version)
         ON CONFLICT (name) DO UPDATE SET value=version;
end;
$$;
