import { LayerSpecification } from "maplibre-gl";
export interface Layer {
  id : number;
  lyrNumOrder : number;
  domId : number;
  astId : number;
  treGroupId : number;
  treSimplifiedGroupId : number;
  lyrTableName : string;
  lyrGeomColumnName : string;
  lyrUuidColumnName : string;
  lyrGeomSrid : string;
  lyrStyle : string;
  lyrSlabel : string;
  lyrLlabel : string;
  lyrValid : Boolean;
  lyrDisplay : Boolean;
  lyrUcreId : number;
  lyrUmodId : number;
  lyrDcre : Date;
  lyrDmod : Date;
}
