package com.veolia.externalVeoliaApi.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @Autowired
    ExceptionLogger exceptionLogger;

    @ExceptionHandler(FunctionalException.class)
    public ResponseEntity<ExceptionResponse> handleFunctionalException(FunctionalException functionalException, HttpServletRequest request) {
        exceptionLogger.log(functionalException, request);

        ExceptionResponse exceptionResponse = new ExceptionResponse(functionalException, request);
        return new ResponseEntity<>(exceptionResponse, functionalException.getStatus());
    }

    @ExceptionHandler(TechnicalException.class)
    public ResponseEntity<ExceptionResponse> handleTechnicalException(TechnicalException technicalException, HttpServletRequest request) {
        exceptionLogger.log(technicalException, request);

        ExceptionResponse exceptionResponse = new ExceptionResponse(technicalException, request);
        return new ResponseEntity<>(exceptionResponse, technicalException.getStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleUnhandledException(Exception exception, HttpServletRequest request) {
        TechnicalException technicalException = new TechnicalException(exception.getMessage());
        technicalException.initCause(exception);

        exceptionLogger.log(technicalException, request);

        ExceptionResponse exceptionResponse = new ExceptionResponse(technicalException, request);
        return new ResponseEntity<>(exceptionResponse, technicalException.getStatus());
    }
}



