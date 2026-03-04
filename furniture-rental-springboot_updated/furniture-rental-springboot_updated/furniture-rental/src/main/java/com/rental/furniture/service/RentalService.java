package com.rental.furniture.service;

import com.rental.furniture.exception.*;
import com.rental.furniture.model.*;
import com.rental.furniture.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RentalService {

    private final RentalRepository rentalRepository;
    private final FurnitureRepository furnitureRepository;
    private final DamageReportRepository damageReportRepository;

    private static final double DAILY_LATE_FEE_RATE = 1.5;

    // ─── Create Rental ─────────────────────────────────────────────────────────

    public Rental createRental(Long furnitureId, Long customerId, String customerName,
                               String customerEmail, LocalDate startDate, LocalDate endDate) {

        if (startDate.isAfter(endDate)) {
            throw new InvalidRentalPeriodException("Start date cannot be after end date.");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new InvalidRentalPeriodException("Start date cannot be in the past.");
        }

        Furniture furniture = furnitureRepository.findById(furnitureId)
                .orElseThrow(() -> new FurnitureRentalException("Furniture not found with ID: " + furnitureId));

        // If not available -> include nextAvailableDate in the exception
        if (!furniture.isAvailable()) {
            LocalDate next = computeNextAvailableDate(furnitureId, startDate, endDate);
            throw new ItemNotAvailableException(furniture.getCode(), next);
        }

        // If requested window conflicts -> include nextAvailableDate in the exception
        List<Rental> conflicts = rentalRepository.findConflictingRentals(furnitureId, startDate, endDate);
        if (!conflicts.isEmpty()) {
            LocalDate next = computeNextAvailableDate(furnitureId, startDate, endDate);
            throw new ItemNotAvailableException(furniture.getCode(), next);
        }

        int days = (int) startDate.until(endDate).getDays();
        if (days == 0) days = 1;

        double totalCost = furniture.calculateRentalCost(days);
        double deposit = furniture.calculateDeposit(days);

        Rental rental = Rental.builder()
                .orderNumber(generateOrderNumber())
                .customerId(customerId)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .furnitureId(furnitureId)
                .furnitureName(furniture.getName())
                .furnitureCode(furniture.getCode())
                .startDate(startDate)
                .endDate(endDate)
                .totalCost(totalCost)
                .deposit(deposit)
                .status(Rental.RentalStatus.ACTIVE)
                .build();

        furniture.setAvailable(false);
        furnitureRepository.save(furniture);

        return rentalRepository.save(rental);
    }
    // ─── Get Rental ────────────────────────────────────────────────────────────

    public Rental getRentalByOrderNumber(String orderNumber) {
        return rentalRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new FurnitureRentalException("Rental not found: " + orderNumber));
    }

    public Rental getRentalById(Long id) {
        return rentalRepository.findById(id)
                .orElseThrow(() -> new FurnitureRentalException("Rental not found with ID: " + id));
    }

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }

    public List<Rental> getActiveRentals() {
        return rentalRepository.findByStatus(Rental.RentalStatus.ACTIVE);
    }

    public List<Rental> getOverdueRentals() {
        return rentalRepository.findOverdueRentals(LocalDate.now());
    }

    public List<Rental> getRecentRentals() {
        return rentalRepository.findTop10ByOrderByIdDesc();
    }

    // ─── Extend Rental ─────────────────────────────────────────────────────────
    public Rental extendRental(String orderNumber, LocalDate newEndDate) {
        Rental rental = getRentalByOrderNumber(orderNumber);

        if (rental.getStatus() == Rental.RentalStatus.RETURNED) {
            throw new FurnitureRentalException("Cannot extend a returned rental.");
        }
        if (!newEndDate.isAfter(rental.getEndDate())) {
            throw new InvalidRentalPeriodException("New end date must be after current end date.");
        }

        // ✅ Block extension if the rental is already overdue
        long lateDays = rental.getLateDays();
        if (lateDays > 0) {
            throw new OverdueRentalException(rental.getOrderNumber(), lateDays);
        }

        // Check conflicts for the extension window (day after current end to new end)
        LocalDate extStart = rental.getEndDate().plusDays(1);
        List<Rental> conflicts = rentalRepository.findConflictingRentals(
                rental.getFurnitureId(), extStart, newEndDate);

        if (!conflicts.isEmpty()) {
            // Include nextAvailableDate for the extension period
            LocalDate next = computeNextAvailableDate(rental.getFurnitureId(), extStart, newEndDate);
            // Prefer code from rental; or you can fetch Furniture and use getCode()
            throw new ItemNotAvailableException(rental.getFurnitureCode(), next);
        }

        Furniture furniture = furnitureRepository.findById(rental.getFurnitureId())
                .orElseThrow(() -> new FurnitureRentalException("Furniture not found."));

        rental.setEndDate(newEndDate);
        int days = (int) rental.getStartDate().until(newEndDate).getDays();
        if (days == 0) days = 1;
        rental.setTotalCost(furniture.calculateRentalCost(days));
        rental.setDeposit(furniture.calculateDeposit(days));
        rental.setStatus(Rental.RentalStatus.EXTENDED);

        return rentalRepository.save(rental);
    }
    // ─── Return Furniture ──────────────────────────────────────────────────────

    public Map<String, Object> processReturn(String orderNumber,
                                              Furniture.FurnitureCondition returnCondition,
                                              String damageNotes, Double damageCharge) {
        Rental rental = getRentalByOrderNumber(orderNumber);

        if (rental.getStatus() == Rental.RentalStatus.RETURNED) {
            throw new FurnitureRentalException("Rental already returned.");
        }

        Furniture furniture = furnitureRepository.findById(rental.getFurnitureId())
                .orElseThrow(() -> new FurnitureRentalException("Furniture not found."));

        LocalDate returnDate = LocalDate.now();
        long lateDays = rental.getLateDays();
        double lateFee = lateDays > 0 ? rental.calculateLateFee(furniture.getDailyRate()) : 0.0;
        double totalDamageCharge = damageCharge != null ? damageCharge : 0.0;
        double totalCharges = rental.getTotalCost() + lateFee + totalDamageCharge;
        double depositRefund = Math.max(0, rental.getDeposit() - totalDamageCharge);

        rental.setReturnDate(returnDate);
        rental.setReturnCondition(returnCondition);
        rental.setDamageNotes(damageNotes);
        rental.setDamageCharge(totalDamageCharge);
        rental.setStatus(Rental.RentalStatus.RETURNED);

        furniture.setAvailable(true);
        furniture.setCondition(returnCondition);
        furnitureRepository.save(furniture);
        rentalRepository.save(rental);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("orderNumber", orderNumber);
        summary.put("returnDate", returnDate.toString());
        summary.put("baseCost", rental.getTotalCost());
        summary.put("lateFee", lateFee);
        summary.put("lateDays", lateDays);
        summary.put("damageCharge", totalDamageCharge);
        summary.put("totalCharges", totalCharges);
        summary.put("depositPaid", rental.getDeposit());
        summary.put("depositRefund", depositRefund);
        summary.put("additionalDue", Math.max(0, totalCharges - rental.getDeposit() - rental.getTotalCost()));

        return summary;
    }

    // ─── Update Overdue Status ─────────────────────────────────────────────────

    public int markOverdueRentals() {
        List<Rental> overdue = rentalRepository.findOverdueRentals(LocalDate.now());
        overdue.forEach(r -> r.setStatus(Rental.RentalStatus.OVERDUE));
        rentalRepository.saveAll(overdue);
        return overdue.size();
    }

    // ─── Stats ─────────────────────────────────────────────────────────────────

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = rentalRepository.count();
        long active = rentalRepository.findByStatus(Rental.RentalStatus.ACTIVE).size();
        long overdue = rentalRepository.findOverdueRentals(LocalDate.now()).size();
        Double revenue = rentalRepository.getTotalRevenue();

        stats.put("totalRentals", total);
        stats.put("activeRentals", active);
        stats.put("overdueRentals", overdue);
        stats.put("totalRevenue", revenue != null ? revenue : 0.0);

        Map<String, Long> byStatus = Arrays.stream(Rental.RentalStatus.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        s -> (long) rentalRepository.findByStatus(s).size()
                ));
        stats.put("byStatus", byStatus);
        return stats;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    // RentalService.java
    private LocalDate computeNextAvailableDate(Long furnitureId, LocalDate requestedStart, LocalDate requestedEnd) {
        // If you want to be precise for the requested window:
        LocalDate maxEndInRange = rentalRepository.findMaxEndDateWithinRange(furnitureId, requestedStart, requestedEnd);
        if (maxEndInRange != null) {
            return maxEndInRange.plusDays(1);
        }

        // Fallback: if furniture is globally tied up beyond requested window
        LocalDate maxEnd = rentalRepository.findMaxEndDateForActiveBookings(furnitureId);
        return (maxEnd != null) ? maxEnd.plusDays(1) : requestedStart; // if null, it's available by requestedStart
    }
}
