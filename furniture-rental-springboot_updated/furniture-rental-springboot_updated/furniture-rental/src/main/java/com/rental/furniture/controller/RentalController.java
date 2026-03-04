package com.rental.furniture.controller;

import com.rental.furniture.model.*;
import com.rental.furniture.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rentals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RentalController {

    private final RentalService rentalService;

    @GetMapping
    public ResponseEntity<List<Rental>> getAllRentals(
            @RequestParam(required = false) Rental.RentalStatus status) {
        List<Rental> result = status != null
                ? rentalService.getAllRentals().stream()
                    .filter(r -> r.getStatus() == status).toList()
                : rentalService.getAllRentals();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Rental>> getRecentRentals() {
        return ResponseEntity.ok(rentalService.getRecentRentals());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Rental>> getOverdueRentals() {
        return ResponseEntity.ok(rentalService.getOverdueRentals());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(rentalService.getDashboardStats());
    }

    @GetMapping("/{orderNo}")
    public ResponseEntity<Rental> getRental(@PathVariable String orderNo) {
        return ResponseEntity.ok(rentalService.getRentalByOrderNumber(orderNo));
    }

    @PostMapping
    public ResponseEntity<Rental> createRental(@RequestBody Map<String, Object> body) {
        Long furnitureId = Long.valueOf(body.get("furnitureId").toString());
        Long customerId = Long.valueOf(body.get("customerId").toString());
        String customerName = body.get("customerName").toString();
        String customerEmail = body.get("customerEmail").toString();
        LocalDate startDate = LocalDate.parse(body.get("startDate").toString());
        LocalDate endDate = LocalDate.parse(body.get("endDate").toString());

        Rental rental = rentalService.createRental(
                furnitureId, customerId, customerName, customerEmail, startDate, endDate);
        return ResponseEntity.status(HttpStatus.CREATED).body(rental);
    }

    @PutMapping("/{orderNo}/extend")
    public ResponseEntity<Rental> extendRental(
            @PathVariable String orderNo,
            @RequestBody Map<String, String> body) {
        LocalDate newEndDate = LocalDate.parse(body.get("newEndDate"));
        return ResponseEntity.ok(rentalService.extendRental(orderNo, newEndDate));
    }

    @PostMapping("/{orderNo}/return")
    public ResponseEntity<Map<String, Object>> returnFurniture(
            @PathVariable String orderNo,
            @RequestBody Map<String, Object> body) {

        Furniture.FurnitureCondition condition = Furniture.FurnitureCondition.valueOf(
                body.get("returnCondition").toString());
        String notes = body.containsKey("damageNotes") ? body.get("damageNotes").toString() : null;
        Double charge = body.containsKey("damageCharge")
                ? Double.valueOf(body.get("damageCharge").toString()) : null;

        return ResponseEntity.ok(rentalService.processReturn(orderNo, condition, notes, charge));
    }

    @PostMapping("/mark-overdue")
    public ResponseEntity<Map<String, Object>> markOverdue() {
        int count = rentalService.markOverdueRentals();
        return ResponseEntity.ok(Map.of("markedOverdue", count));
    }
}
