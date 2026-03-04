package com.rental.furniture.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ItemNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleItemNotAvailable(ItemNotAvailableException ex) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage(),
                ex.getNextAvailableDate() != null
                        ? Map.of("nextAvailableDate", ex.getNextAvailableDate().toString())
                        : Collections.emptyMap());
    }

    @ExceptionHandler(OverdueRentalException.class)
    public ResponseEntity<Map<String, Object>> handleOverdue(OverdueRentalException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(),
                Map.of("daysOverdue", ex.getDaysOverdue()));
    }

    @ExceptionHandler(InsufficientDepositException.class)
    public ResponseEntity<Map<String, Object>> handleDeposit(InsufficientDepositException ex) {
        return buildError(HttpStatus.PAYMENT_REQUIRED, ex.getMessage(),
                Map.of("required", ex.getRequired(), "provided", ex.getProvided()));
    }

    @ExceptionHandler(InvalidRentalPeriodException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidPeriod(InvalidRentalPeriodException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), Collections.emptyMap());
    }

    @ExceptionHandler(FurnitureRentalException.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(FurnitureRentalException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), Collections.emptyMap());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.toList());

        return buildError(HttpStatus.BAD_REQUEST,
                "Validation failed",
                Map.of("errors", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), Collections.emptyMap());
    }





    //t-c-f
    private ResponseEntity<Map<String, Object>> buildError(
            HttpStatus status, String message, Map<String, Object> extra) {

        Map<String, Object> body = new LinkedHashMap<>();

        try {
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("status", status.value());
            body.put("error", status.getReasonPhrase());
            body.put("message", message);
            body.putAll(extra);

            return ResponseEntity.status(status).body(body);

        } catch (Exception e) {

            Map<String, Object> fallback = new HashMap<>();
            fallback.put("timestamp", LocalDateTime.now().toString());
            fallback.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            fallback.put("error", "Error while building exception response");
            fallback.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(fallback);

        } finally {
            // This block executes ALWAYS (success or failure)
            System.out.println("Exception response created at: " + LocalDateTime.now());
        }
    }
}
