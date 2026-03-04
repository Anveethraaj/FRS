package com.rental.furniture.exception;

public class InsufficientDepositException extends FurnitureRentalException {
    private final double required;
    private final double provided;
    public InsufficientDepositException(double required, double provided) {
        super("Insufficient deposit. Required: $" + required + ", Provided: $" + provided);
        this.required = required;
        this.provided = provided;
    }
    public double getRequired() { return required; }
    public double getProvided() { return provided; }
}
