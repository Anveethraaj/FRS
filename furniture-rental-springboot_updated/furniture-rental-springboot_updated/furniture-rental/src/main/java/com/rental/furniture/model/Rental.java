package com.rental.furniture.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "rentals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderNumber;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    private String customerEmail;

    @NotNull(message = "Furniture ID is required")
    private Long furnitureId;

    private String furnitureName;
    private String furnitureCode;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private LocalDate returnDate;

    private Double totalCost;
    private Double deposit;
    private Double damageCharge;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RentalStatus status = RentalStatus.ACTIVE;

    private String damageNotes;

    @Enumerated(EnumType.STRING)
    private Furniture.FurnitureCondition returnCondition;

    public long getRentalDays() {
        return ChronoUnit.DAYS.between(startDate, endDate);
    }

    public long getLateDays() {
        if (returnDate == null) {
            LocalDate today = LocalDate.now();
            if (today.isAfter(endDate)) return ChronoUnit.DAYS.between(endDate, today);
        } else {
            if (returnDate.isAfter(endDate)) return ChronoUnit.DAYS.between(endDate, returnDate);
        }
        return 0;
    }

    public double calculateLateFee(double dailyRate) {
        return getLateDays() * dailyRate * 1.5;
    }

    public enum RentalStatus { ACTIVE, RETURNED, OVERDUE, EXTENDED }
}
