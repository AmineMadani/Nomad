/*****************************
 * Create extensions for APP *
 *****************************/

 create extension if not exists postgis;
 CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/**************************
 * Create schemas for APP *
 **************************/

create schema if not exists config;
comment on schema config is 'Schema where references and constants are stored';

create schema if not exists utils;
comment on schema utils is 'Utilitary functions';

create schema settings;
comment on schema settings is 'Schema where user settings are stored';
