// ItemNotAvailableException.java
package com.rental.furniture.exception;

import java.time.LocalDate;

public class ItemNotAvailableException extends FurnitureRentalException {
    private final String furnitureCode;
    private final LocalDate nextAvailableDate;

    public ItemNotAvailableException(String furnitureCode) {
        super("Furniture item '" + furnitureCode + "' is not available.");
        this.furnitureCode = furnitureCode;
        this.nextAvailableDate = null;
    }

    public ItemNotAvailableException(String furnitureCode, LocalDate nextAvailableDate) {
        super("Furniture item '" + furnitureCode + "' is not available.");
        this.furnitureCode = furnitureCode;
        this.nextAvailableDate = nextAvailableDate;
    }

    public String getFurnitureCode() { return furnitureCode; }
    public LocalDate getNextAvailableDate() { return nextAvailableDate; }
}