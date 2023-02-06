---
titre: POSTGRES/POSTGIS model
auteurs:  Anthony Yung @Be Map Guest
---

# Database Documention

## Repo structure

```
├── bin .................... tools to install DB for example.
├── sql .................... database components.
├── conf ................... configuration.
└── README.md
```

## Database structure

Thee database has 3 mains schemas.

```
├── config   .................... Schema that stores APP configuration.
├── settings .................... Schema that stores APP settings (srid, layers, version...).
└── utils    .................... Schema that stores the utils functions
```

The assets are stored in one o several schemas of the same database.
In the layer configuration table, we specify the exact location of the asset tables.


### > Config Schema

The config schema stores all the configuration tables.

#### TABLE : application_domain

This core configuration table defines the business domains that the application manages.

#### TABLE :  layer

The layer table defines all the layers that are managed by the application.
A layer can be attached to an application domain and points to a PG table.

#### TABLE :  layer_tree

This table defines the tree exposed in the application.

#### TABLE :  raster_layer

This table lists up the web services exposed as basemaps in the application.

### > Settings Schema

This schema store all the settings ;of the application :
- version, srid, and tile server.

It can store any settings and the schema has specific function to select one or several settings.

### > Utils Schema

This schema store all the general functions used in the application:
