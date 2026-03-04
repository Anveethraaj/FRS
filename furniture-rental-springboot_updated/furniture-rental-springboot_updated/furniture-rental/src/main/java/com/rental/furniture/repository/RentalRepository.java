package com.rental.furniture.repository;

import com.rental.furniture.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    Optional<Rental> findByOrderNumber(String orderNumber);

    List<Rental> findByCustomerId(Long customerId);

    List<Rental> findByFurnitureId(Long furnitureId);

    List<Rental> findByStatus(Rental.RentalStatus status);

    @Query("SELECT r FROM Rental r WHERE r.status = 'ACTIVE' AND r.endDate < :today")
    List<Rental> findOverdueRentals(@Param("today") LocalDate today);

    @Query("SELECT r FROM Rental r WHERE r.furnitureId = :furnitureId " +
           "AND r.status IN ('ACTIVE', 'EXTENDED') " +
           "AND r.startDate <= :endDate AND r.endDate >= :startDate")
    List<Rental> findConflictingRentals(
        @Param("furnitureId") Long furnitureId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(r.totalCost), 0) FROM Rental r WHERE r.status IN ('RETURNED')")
    Double getTotalRevenue();

    // RentalRepository.java
    @Query("""
    SELECT MAX(r.endDate)
    FROM Rental r
    WHERE r.furnitureId = :furnitureId
      AND r.status IN (com.rental.furniture.model.Rental$RentalStatus.ACTIVE,
                       com.rental.furniture.model.Rental$RentalStatus.EXTENDED,
                       com.rental.furniture.model.Rental$RentalStatus.OVERDUE)
""")
    LocalDate findMaxEndDateForActiveBookings(@Param("furnitureId") Long furnitureId);

    // Optional: max endDate among conflicts with a requested period
    @Query("""
    SELECT MAX(r.endDate)
    FROM Rental r
    WHERE r.furnitureId = :furnitureId
      AND r.startDate <= :requestedEnd
      AND r.endDate   >= :requestedStart
      AND r.status IN (com.rental.furniture.model.Rental$RentalStatus.ACTIVE,
                       com.rental.furniture.model.Rental$RentalStatus.EXTENDED,
                       com.rental.furniture.model.Rental$RentalStatus.OVERDUE)
""")
    LocalDate findMaxEndDateWithinRange(@Param("furnitureId") Long furnitureId,
                                        @Param("requestedStart") LocalDate requestedStart,
                                        @Param("requestedEnd") LocalDate requestedEnd);

    List<Rental> findByCustomerNameContainingIgnoreCase(String name);

    List<Rental> findTop10ByOrderByIdDesc();
}
