import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, CapacitorSQLitePlugin } from '@capacitor-community/sqlite';
import { Directory, Filesystem } from '@capacitor/filesystem';
import * as pako from "pako";
import MapLibreGL from "maplibre-gl";
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BasemapOfflineService {

  sqliteConnection!: SQLiteConnection;
  isService: boolean = false;
  platform!: string;
  sqlitePlugin!: CapacitorSQLitePlugin;
  native: boolean = false;
  db: SQLiteDBConnection;

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * Plugin database Initialization
   */
  public async initializePlugin(): Promise<void> {
    this.platform = Capacitor.getPlatform();
    if (this.platform === 'ios' || this.platform === 'android') this.native = true;
    if (this.native) {
      this.sqlitePlugin = CapacitorSQLite;
      this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
      this.isService = true;
      let dbList = [];
      try {
        dbList = (await this.sqliteConnection.getDatabaseList()).values;
      } catch (e) {
        dbList = [];
      }
      if (dbList.includes('territorySQLite.db')) {
        this.openDatabase('territory', false, "no-encryption", 1, false);
      }
      MapLibreGL.addProtocol("offline", (params, callback) => {
        let coords = params.url.replace('offline://', '').replace('.vector.pbf', '').split("/");
        this.getTileFromDatabase(Number(coords[0]), Number(coords[1]), Number(coords[2])).then((tileBuffer) => {
          if (tileBuffer) {
            callback(null, tileBuffer, null, null);
          } else {
            let message = `Tile is not in DB: ${params.url}`;
            callback(new Error(message));
          }
        });
        return { cancel: () => { } };
      });
    }
  }

  /**
   * Get the database connection
   * @param dbName Name of the db
   * @param encrypted Encryption
   * @param mode Connection mode
   * @param version Version to use
   * @param readonly read only
   * @returns the database connection
   */
  public async openDatabase(dbName: string, encrypted: boolean, mode: string, version: number, readonly: boolean): Promise<SQLiteDBConnection> {
    const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
    let isConn = (await this.sqliteConnection.isConnection(dbName, readonly)).result;
    if (retCC && isConn) {
      this.db = await this.sqliteConnection.retrieveConnection(dbName, readonly);
    } else {
      this.db = await this.sqliteConnection
        .createConnection(dbName, encrypted, mode, version, readonly);
    }
    await this.db.open();
    return this.db;
  }

  /**
   * Method to move the mbtile file to the database apk folder and rename extension in .db
   */
  public moveDatabasesAndAddSuffix(): Promise<void> {
    return this.sqliteConnection.moveDatabasesAndAddSuffix('databaseCopy', ['territory']);
  }

  /**
   * Method to delete a database
   */
  public async deleteDatabase(): Promise<void> {
    if (this.native) {
      try {
        // Close the database connection before deleting
        if (this.db) {
          await this.db.close();
          // Delete the database
          this.db.delete();
        }

      } catch (error) {
        console.error(`Error removing database:`, error);
      }
    }
  }

  /**
   * Download the offline basemap file
   */
  public async downloadOfflineData(urlFile: string, onProgressPercentage: Function) {
    Filesystem.addListener('progress', progress => {
      const newPercentage = ((progress.bytes / progress.contentLength) * 100);
      onProgressPercentage(newPercentage);
    });

    const result = await Filesystem.downloadFile({
      progress: true,
      directory: Directory.Data,
      path: 'territory',
      url: urlFile
    });

    // Manage errors
    const errorText = await result.blob.text();
    if (errorText.includes('<Error>')) {
      throw new Error('Basemap download failed');
    }

    if (this.native) {
      await this.moveDatabasesAndAddSuffix();

      let dbList = [];
      try {
        dbList = (await this.sqliteConnection.getDatabaseList()).values;
      } catch (e) {
        dbList = [];
      }
      if (dbList.includes('territorySQLite.db')) {
        this.openDatabase('territory', false, "no-encryption", 1, false);
      }
    }
  }

  public async getTileFromDatabase(z: number, x: number, y: number): Promise<ArrayBuffer> {
    let params = [z, x, Math.pow(2, z) - y - 1];
    return new Promise<ArrayBuffer>(async (resolve, reject) => {
      let tiles = await this.db.query("select HEX(tile_data) as tile_data_hex from tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ? limit 1;", params);
      if (tiles.values.length !== 1) {
        reject(new Error("No tile..."));
        return;
      }
      const hexData = tiles.values[0].tile_data_hex;
      let binData = new Uint8Array(hexData.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));
      let isGzipped = binData[0] === 0x1f && binData[1] === 0x8b;
      if (isGzipped) {
        binData = pako.inflate(binData);
      }
      resolve(binData);
    });
  }

  public async getOfflineStyleLayer(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.httpClient.get("./assets/offline/offlineStyle.json", { observe: 'response' }).subscribe({
        next: (response: any) => {
          resolve(response.body);
        },
        error: (err) => { reject(err) }
      });
    });
  }
}
