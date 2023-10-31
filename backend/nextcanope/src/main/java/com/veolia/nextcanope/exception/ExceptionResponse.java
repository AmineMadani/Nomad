package com.veolia.nextcanope.exception;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;

public class ExceptionResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    public ExceptionResponse(NomadException nomadException, HttpServletRequest request) {
        this.timestamp = nomadException.getTimestamp();
        this.status = nomadException.getStatus().value();
        this.error = nomadException.getStatus().getReasonPhrase();
        this.message = nomadException.getResponseMessage();
        this.path = request.getRequestURI();
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
