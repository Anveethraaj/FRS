package com.rental.furniture.repository;

import com.rental.furniture.model.DamageReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DamageReportRepository extends JpaRepository<DamageReport, Long> {

    List<DamageReport> findByRentalId(Long rentalId);

    List<DamageReport> findByFurnitureId(Long furnitureId);

    List<DamageReport> findBySeverity(DamageReport.DamageSeverity severity);
}
