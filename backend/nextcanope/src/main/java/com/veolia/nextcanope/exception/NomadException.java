package com.veolia.nextcanope.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public class NomadException extends RuntimeException {
    private final LocalDateTime timestamp;
    protected HttpStatus status;
    protected String responseMessage;

    public NomadException(String errorMessage) {
        super(errorMessage);
        this.timestamp = LocalDateTime.now();
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getResponseMessage() {
        return responseMessage;
    }
}

