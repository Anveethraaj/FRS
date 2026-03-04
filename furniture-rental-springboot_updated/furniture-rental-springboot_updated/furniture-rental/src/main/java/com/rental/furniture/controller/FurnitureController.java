package com.rental.furniture.controller;

import com.rental.furniture.model.Furniture;
import com.rental.furniture.service.FurnitureService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/furniture")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FurnitureController {

    private final FurnitureService furnitureService;

    @GetMapping
    public ResponseEntity<List<Furniture>> getAllFurniture(
            @RequestParam(required = false) Furniture.FurnitureCategory category,
            @RequestParam(required = false) Boolean available) {

        List<Furniture> result;
        if (category != null && available != null && available) {
            result = furnitureService.getAvailableByCategory(category);
        } else if (category != null) {
            result = furnitureService.getFurnitureByCategory(category);
        } else if (available != null && available) {
            result = furnitureService.getAvailableFurniture();
        } else {
            result = furnitureService.getAllFurniture();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Furniture>> getAvailableForDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Furniture.FurnitureCategory category) {

        List<Furniture> result = category != null
                ? furnitureService.getAvailableForDateRangeByCategory(startDate, endDate, category)
                : furnitureService.getAvailableForDateRange(startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{code}")
    public ResponseEntity<Furniture> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(furnitureService.getFurnitureByCode(code));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(furnitureService.getInventoryStats());
    }

    @PostMapping
    public ResponseEntity<Furniture> addFurniture(@RequestBody Furniture furniture) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(furnitureService.addFurniture(furniture));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Furniture> updateFurniture(@PathVariable Long id,
                                                      @RequestBody Furniture furniture) {
        return ResponseEntity.ok(furnitureService.updateFurniture(id, furniture));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFurniture(@PathVariable Long id) {
        furnitureService.deleteFurniture(id);
        return ResponseEntity.ok(Map.of("message", "Furniture deleted successfully."));
    }
}
