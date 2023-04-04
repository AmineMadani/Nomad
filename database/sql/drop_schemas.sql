/*****************************
 * Create extensions for APP *
 *****************************/

create extension if not exists postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/**************************
 * drop schemas for APP *
 **************************/

drop schema if exists config cascade;
drop schema if exists exploitation cascade;
