package com.rental.furniture.service;

import com.rental.furniture.exception.*;
import com.rental.furniture.model.Furniture;
import com.rental.furniture.repository.FurnitureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FurnitureService {

    private final FurnitureRepository furnitureRepository;

    // ─── CRUD ──────────────────────────────────────────────────────────────────

    public List<Furniture> getAllFurniture() {
        return furnitureRepository.findAll();
    }

    public List<Furniture> getFurnitureByCategory(Furniture.FurnitureCategory category) {
        return furnitureRepository.findByCategory(category);
    }

    public List<Furniture> getAvailableFurniture() {
        return furnitureRepository.findByAvailableTrue();
    }

    public List<Furniture> getAvailableByCategory(Furniture.FurnitureCategory category) {
        return furnitureRepository.findByCategoryAndAvailableTrue(category);
    }

    public Furniture getFurnitureByCode(String code) {
        return furnitureRepository.findByCode(code)
                .orElseThrow(() -> new FurnitureRentalException("Furniture not found with code: " + code));
    }

    public Furniture getFurnitureById(Long id) {
        return furnitureRepository.findById(id)
                .orElseThrow(() -> new FurnitureRentalException("Furniture not found with ID: " + id));
    }

    public Furniture addFurniture(Furniture furniture) {
        if (furnitureRepository.existsByCode(furniture.getCode())) {
            throw new FurnitureRentalException("Furniture with code '" + furniture.getCode() + "' already exists.");
        }
        return furnitureRepository.save(furniture);
    }

    public Furniture updateFurniture(Long id, Furniture updated) {
        Furniture existing = getFurnitureById(id);
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getDailyRate() != null) existing.setDailyRate(updated.getDailyRate());
        if (updated.getCondition() != null) existing.setCondition(updated.getCondition());
        existing.setAvailable(updated.isAvailable());
        if (updated.getIsRecliner() != null) existing.setIsRecliner(updated.getIsRecliner());
        if (updated.getNumberOfChairs() != null) existing.setNumberOfChairs(updated.getNumberOfChairs());
        if (updated.getSize() != null) existing.setSize(updated.getSize());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        return furnitureRepository.save(existing);
    }

    public void deleteFurniture(Long id) {
        furnitureRepository.deleteById(id);
    }

    // ─── Availability ──────────────────────────────────────────────────────────

    public List<Furniture> getAvailableForDateRange(LocalDate start, LocalDate end) {
        return furnitureRepository.findAvailableForDateRange(start, end);
    }

    public List<Furniture> getAvailableForDateRangeByCategory(
            LocalDate start, LocalDate end, Furniture.FurnitureCategory category) {
        return furnitureRepository.findAvailableByDateRangeAndCategory(start, end, category);
    }

    // ─── Stats ─────────────────────────────────────────────────────────────────

    public Map<String, Object> getInventoryStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", furnitureRepository.count());
        stats.put("available", furnitureRepository.countAvailable());

        Map<String, Long> byCategory = Arrays.stream(Furniture.FurnitureCategory.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        c -> furnitureRepository.countByCategory(c),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
        stats.put("byCategory", byCategory);
        return stats;
    }

    // ─── Stream Operations (Java 8+) ───────────────────────────────────────────

    public Map<Furniture.FurnitureCategory, List<Furniture>> groupByCategory() {
        return furnitureRepository.findAll().stream()
                .collect(Collectors.groupingBy(Furniture::getCategory));
    }

    public List<Furniture> sortByDailyRate() {
        return furnitureRepository.findAll().stream()
                .sorted(Comparator.comparingDouble(Furniture::getDailyRate))
                .collect(Collectors.toList());
    }

    public double getTotalInventoryValue() {
        return furnitureRepository.findAll().stream()
                .mapToDouble(Furniture::getDailyRate)
                .sum();
    }
}
