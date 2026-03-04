package com.rental.furniture.exception;

// ─── Parent Exception ──────────────────────────────────────────────────────────
public class FurnitureRentalException extends RuntimeException {
    public FurnitureRentalException(String message) { super(message); }
    public FurnitureRentalException(String message, Throwable cause) { super(message, cause); }
}

