import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, CapacitorSQLitePlugin } from '@capacitor-community/sqlite';
import { Directory, Filesystem } from '@capacitor/filesystem';

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

    constructor() {
    }

    /**
     * Plugin database Initialization
     */
    public async initializePlugin(): Promise<void> {
        console.log("init plugin");
        this.platform = Capacitor.getPlatform();
        if (this.platform === 'ios' || this.platform === 'android') this.native = true;
        if(this.native) {
            this.sqlitePlugin = CapacitorSQLite;
            this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
            this.isService = true;
            const dbList = await this.sqliteConnection.getDatabaseList();
            if(dbList.values.includes('territorySQLite.db')){
                this.openDatabase('territory', false, "no-encryption",1,false);
            }
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
        return this.sqliteConnection.moveDatabasesAndAddSuffix('databaseCopy',['territory']);
    }

    /**
     * Download the offline basemap file
     */
    public async downloadOfflineData(urlFile:string) {

        Filesystem.addListener('progress', progress => {
            console.log(`Progress: ${((progress.bytes / progress.contentLength) * 100).toFixed(0)}%`);
        });

        await Filesystem.downloadFile({
            progress: true,
            directory: Directory.Data,
            path: 'territory',
            url: urlFile
        })
    }
}
