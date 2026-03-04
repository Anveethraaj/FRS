package com.rental.furniture.repository;

import com.rental.furniture.model.Furniture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FurnitureRepository extends JpaRepository<Furniture, Long> {

    Optional<Furniture> findByCode(String code);

    List<Furniture> findByCategory(Furniture.FurnitureCategory category);

    List<Furniture> findByAvailableTrue();

    List<Furniture> findByCategoryAndAvailableTrue(Furniture.FurnitureCategory category);

    List<Furniture> findByCondition(Furniture.FurnitureCondition condition);

    boolean existsByCode(String code);

    @Query("SELECT f FROM Furniture f WHERE f.available = true " +
           "AND f.id NOT IN (" +
           "  SELECT r.furnitureId FROM Rental r " +
           "  WHERE r.status IN ('ACTIVE', 'EXTENDED') " +
           "  AND r.startDate <= :endDate AND r.endDate >= :startDate" +
           ")")
    List<Furniture> findAvailableForDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT f FROM Furniture f WHERE f.available = true " +
           "AND f.category = :category " +
           "AND f.id NOT IN (" +
           "  SELECT r.furnitureId FROM Rental r " +
           "  WHERE r.status IN ('ACTIVE', 'EXTENDED') " +
           "  AND r.startDate <= :endDate AND r.endDate >= :startDate" +
           ")")
    List<Furniture> findAvailableByDateRangeAndCategory(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("category") Furniture.FurnitureCategory category
    );

    @Query("SELECT COUNT(f) FROM Furniture f WHERE f.category = :category")
    long countByCategory(@Param("category") Furniture.FurnitureCategory category);

    @Query("SELECT COUNT(f) FROM Furniture f WHERE f.available = true")
    long countAvailable();
}
