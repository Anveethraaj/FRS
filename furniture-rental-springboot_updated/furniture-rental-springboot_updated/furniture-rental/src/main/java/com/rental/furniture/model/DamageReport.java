package com.rental.furniture.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "damage_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DamageReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long rentalId;
    private Long furnitureId;

    @Enumerated(EnumType.STRING)
    private DamageType damageType;

    @Enumerated(EnumType.STRING)
    private DamageSeverity severity;

    private String description;
    private Double repairCostEstimate;
    private LocalDate reportDate;

    @Builder.Default
    private boolean chargedToCustomer = false;

    public enum DamageType {
        TEAR, STAIN, BROKEN_FRAME, SCRATCH, WATER_DAMAGE,
        BROKEN_LEGS, BROKEN_MECHANISM, MISSING_PART, OTHER
    }

    public enum DamageSeverity {
        MINOR, MODERATE, SEVERE
    }
}
