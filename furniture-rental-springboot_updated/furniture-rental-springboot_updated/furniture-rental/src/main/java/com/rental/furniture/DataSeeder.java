package com.rental.furniture;

import com.rental.furniture.model.Furniture;
import com.rental.furniture.model.Rental;
import com.rental.furniture.repository.FurnitureRepository;
import com.rental.furniture.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final FurnitureRepository furnitureRepository;
    private final RentalRepository rentalRepository;

    @Override
    public void run(String... args) {
        if (furnitureRepository.count() > 0) return;

        List<Furniture> items = List.of(
            Furniture.builder().code("SOFA001").name("Leather Recliner Sofa").category(Furniture.FurnitureCategory.SOFA)
                .dailyRate(25.00).condition(Furniture.FurnitureCondition.EXCELLENT).isRecliner(true)
                .description("Premium 3-seater leather recliner sofa").build(),
            Furniture.builder().code("SOFA002").name("Fabric Corner Sofa").category(Furniture.FurnitureCategory.SOFA)
                .dailyRate(18.00).condition(Furniture.FurnitureCondition.GOOD).isRecliner(false)
                .description("L-shaped fabric corner sofa").build(),
            Furniture.builder().code("TABLE001").name("Dining Table Set").category(Furniture.FurnitureCategory.TABLE)
                .dailyRate(15.00).condition(Furniture.FurnitureCondition.EXCELLENT).numberOfChairs(6)
                .description("6-seater solid wood dining table").build(),
            Furniture.builder().code("TABLE002").name("Coffee Table").category(Furniture.FurnitureCategory.TABLE)
                .dailyRate(8.00).condition(Furniture.FurnitureCondition.GOOD).numberOfChairs(0)
                .description("Glass top coffee table").build(),
            Furniture.builder().code("CHAIR001").name("Office Chair").category(Furniture.FurnitureCategory.CHAIR)
                .dailyRate(5.00).condition(Furniture.FurnitureCondition.EXCELLENT)
                .description("Ergonomic mesh office chair").build(),
            Furniture.builder().code("CHAIR002").name("Accent Arm Chair").category(Furniture.FurnitureCategory.CHAIR)
                .dailyRate(7.00).condition(Furniture.FurnitureCondition.GOOD)
                .description("Velvet upholstered accent chair").build(),
            Furniture.builder().code("BED001").name("King Size Bed Frame").category(Furniture.FurnitureCategory.BED)
                .dailyRate(30.00).condition(Furniture.FurnitureCondition.EXCELLENT).size(Furniture.BedSize.KING)
                .description("Solid oak king size bed frame with storage").build(),
            Furniture.builder().code("BED002").name("Queen Platform Bed").category(Furniture.FurnitureCategory.BED)
                .dailyRate(22.00).condition(Furniture.FurnitureCondition.GOOD).size(Furniture.BedSize.QUEEN)
                .description("Modern platform queen bed").build(),
            Furniture.builder().code("CAB001").name("Wardrobe Cabinet").category(Furniture.FurnitureCategory.CABINET)
                .dailyRate(12.00).condition(Furniture.FurnitureCondition.EXCELLENT)
                .description("4-door sliding wardrobe with mirror").build(),
            Furniture.builder().code("CAB002").name("Bookshelf Cabinet").category(Furniture.FurnitureCategory.CABINET)
                .dailyRate(6.00).condition(Furniture.FurnitureCondition.FAIR)
                .description("5-shelf wooden bookcase").build()
        );

        furnitureRepository.saveAll(items);
        log.info("✅ Seeded {} furniture items.", items.size());

        // Sample rentals
        Furniture sofa = furnitureRepository.findByCode("SOFA002").orElse(null);
        if (sofa != null) {
            int days = 7;
            Rental rental = Rental.builder()
                    .orderNumber("ORD-DEMO-001")
                    .customerId(1001L)
                    .customerName("Alice Johnson")
                    .customerEmail("alice@example.com")
                    .furnitureId(sofa.getId())
                    .furnitureName(sofa.getName())
                    .furnitureCode(sofa.getCode())
                    .startDate(LocalDate.now().minusDays(3))
                    .endDate(LocalDate.now().plusDays(4))
                    .totalCost(sofa.calculateRentalCost(days))
                    .deposit(sofa.calculateDeposit(days))
                    .status(Rental.RentalStatus.ACTIVE)
                    .build();
            sofa.setAvailable(false);
            furnitureRepository.save(sofa);
            rentalRepository.save(rental);
        }

        log.info("✅ Sample rentals seeded.");
    }
}
