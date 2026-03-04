package com.rental.furniture.exception;

public class OverdueRentalException extends FurnitureRentalException {
    private final long daysOverdue;
    public OverdueRentalException(String orderNo, long days) {
        super("Rental " + orderNo + " is overdue by " + days + " day(s).");
        this.daysOverdue = days;
    }
    public long getDaysOverdue() { return daysOverdue; }
}
