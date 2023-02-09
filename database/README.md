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
└── app      .................... Schema that stores APP data
```

The assets are stored in one o several schemas of the same database.
In the layer configuration table, we specify the exact location of the asset tables.


### > Config Schema

The config schema stores all the configuration tables.

#### TABLE : application_domain

This core configuration table defines the business domains that the application manages.
Parent domains appear in the application interface as button that opens a drawer.
The child domains generates a tab in the drawer in which the user sees a simplified layer tree.

#### TABLE :  layer

The layer table defines all the layers that are managed by the application.
A layer can be attached to an application domain and points to a PG table.
To organize the layer in the different trees, the application uses the tree table.
As tree group can be different in the simplified and detailed layer tree, the layer has 2 fields thats points to the tree table.

#### TABLE :  business_object

This configuration table defines the business objects to which the application can generate work orders. The type is the code that will be used in the application to make relation between an asset and a work order.

#### TABLE :  tree

This table defines the tree exposed in the application.
The tree  table is used to generate the simplified and the detailed layer tree.

:warning: **A group tree can be in a the simplified layer tree and not in the detailed tree.** :warning:

To generate the different trees, 2 views are implemented:
- v_simplified_layer_tree : this view gives for each layer the parent domain, the tab it belongs to and its tree group .
- v_detailed_layer_tree : this view gives for each layer the parent domain, its parent group and its group .

#### TABLE :  basemaps

This table lists up the web services exposed as basemaps in the application.
The table is based on the openlayers structure.

Example WMS Openlayers:
```
// For more information about the IGN API key see
// https://geoservices.ign.fr/blog/2021/01/29/Maj_Cles_Geoservices.html
const ign_source = new WMTS({
  url: 'https://wxs.ign.fr/choisirgeoportail/geoportail/wmts',
  layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
  matrixSet: 'PM',
  format: 'image/png',
  projection: 'EPSG:3857',
  tileGrid: tileGrid,
  style: 'normal',
  attributions:
    '<a href="https://www.ign.fr/" target="_blank">' +
    '<img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" title="Institut national de l\'' +
    'information géographique et forestière" alt="IGN"></a>',
});
```
