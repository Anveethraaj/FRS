package com.rental.furniture.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "furniture")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Furniture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FurnitureCategory category;

    @NotNull(message = "Daily rate is required")
    @DecimalMin(value = "0.01", message = "Daily rate must be positive")
    private Double dailyRate;

    @Builder.Default
    private boolean available = true;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FurnitureCondition condition = FurnitureCondition.EXCELLENT;

    // Sofa-specific
    private Boolean isRecliner;

    // Table-specific
    private Integer numberOfChairs;

    // Bed-specific
    @Enumerated(EnumType.STRING)
    private BedSize size;

    private String description;

    // Static counter (non-persisted)
    private static int totalCount = 0;

    public static final double DAMAGE_DEPOSIT_PERCENTAGE = 0.20;

    @PostLoad
    @PostPersist
    public void incrementCount() {
        totalCount++;
    }

    public static int getTotalCount() {
        return totalCount;
    }

    public double calculateRentalCost(int days) {
        double base = dailyRate * days;
        switch (category) {
            case SOFA:
                if (Boolean.TRUE.equals(isRecliner)) base *= 1.15;
                if (days >= 30) base *= 0.90;
                break;
            case TABLE:
                if (numberOfChairs != null && numberOfChairs > 0)
                    base += (numberOfChairs * 5.0 * days);
                break;
            case BED:
                if (size == BedSize.QUEEN) base *= 1.10;
                if (size == BedSize.KING) base *= 1.20;
                break;
            default:
                break;
        }
        return Math.round(base * 100.0) / 100.0;
    }

    public double calculateDeposit(int days) {
        return Math.round(calculateRentalCost(days) * DAMAGE_DEPOSIT_PERCENTAGE * 100.0) / 100.0;
    }

    public enum FurnitureCategory { SOFA, TABLE, CHAIR, BED, CABINET }
    public enum FurnitureCondition { EXCELLENT, GOOD, FAIR, DAMAGED }
    public enum BedSize { SINGLE, DOUBLE, QUEEN, KING }
}
