package com.veolia.nextcanope.dto.itv;

import java.util.List;

public class ReadResultDto {
    private List<ItvBlockDto> listItvBlockDto;
    private String decimalSeparator;

    public List<ItvBlockDto> getListItvBlockDto() {
        return listItvBlockDto;
    }

    public void setListItvBlockDto(List<ItvBlockDto> listItvBlockDto) {
        this.listItvBlockDto = listItvBlockDto;
    }

    public String getDecimalSeparator() {
        return decimalSeparator;
    }

    public void setDecimalSeparator(String decimalSeparator) {
        this.decimalSeparator = decimalSeparator;
    }
}
