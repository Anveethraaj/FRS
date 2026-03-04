package com.rental.furniture.exception;

public class InvalidRentalPeriodException extends FurnitureRentalException {
    public InvalidRentalPeriodException(String message) {
        super("Invalid rental period: " + message);
    }
}
