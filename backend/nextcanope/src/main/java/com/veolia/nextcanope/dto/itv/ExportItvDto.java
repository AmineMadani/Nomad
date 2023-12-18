package com.veolia.nextcanope.dto.itv;

public class ExportItvDto {
    private byte[] data;
    private String filename;

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }
}
