package com.rental.furniture.dto;

import com.rental.furniture.model.Furniture;
import com.rental.furniture.model.Rental;
import lombok.*;

import java.time.LocalDate;

// ─── Furniture DTOs ────────────────────────────────────────────────────────────

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class FurnitureDTO {
    private Long id;
    private String code;
    private String name;
    private Furniture.FurnitureCategory category;
    private Double dailyRate;
    private boolean available;
    private Furniture.FurnitureCondition condition;
    private Boolean isRecliner;
    private Integer numberOfChairs;
    private Furniture.BedSize size;
    private String description;
}

@Data @NoArgsConstructor @AllArgsConstructor
class FurnitureRequest {
    private String code;
    private String name;
    private Furniture.FurnitureCategory category;
    private Double dailyRate;
    private Furniture.FurnitureCondition condition;
    private Boolean isRecliner;
    private Integer numberOfChairs;
    private Furniture.BedSize size;
    private String description;
}

// ─── Rental DTOs ───────────────────────────────────────────────────────────────

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class RentalRequest {
    private Long furnitureId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private LocalDate startDate;
    private LocalDate endDate;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class ReturnRequest {
    private Furniture.FurnitureCondition returnCondition;
    private String damageNotes;
    private Double damageCharge;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
class RentalSummaryDTO {
    private Long id;
    private String orderNumber;
    private String customerName;
    private String furnitureName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalCost;
    private Double deposit;
    private Rental.RentalStatus status;
    private long daysRemaining;
}
