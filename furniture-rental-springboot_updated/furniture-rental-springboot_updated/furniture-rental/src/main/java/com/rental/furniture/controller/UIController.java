package com.rental.furniture.controller;

import com.rental.furniture.model.*;
import com.rental.furniture.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class UIController {

    private final FurnitureService furnitureService;
    private final RentalService rentalService;

    @GetMapping("/")
    public String dashboard(Model model) {
        Map<String, Object> rentalStats = rentalService.getDashboardStats();
        Map<String, Object> inventoryStats = furnitureService.getInventoryStats();

        model.addAttribute("rentalStats", rentalStats);
        model.addAttribute("inventoryStats", inventoryStats);
        model.addAttribute("recentRentals", rentalService.getRecentRentals());
        model.addAttribute("overdueRentals", rentalService.getOverdueRentals());
        model.addAttribute("page", "dashboard");
        return "dashboard";
    }

    @GetMapping("/furniture")
    public String furniture(
            @RequestParam(required = false) Furniture.FurnitureCategory category,
            @RequestParam(required = false) Boolean available,
            Model model) {

        model.addAttribute("furniture",
                category != null ? furnitureService.getFurnitureByCategory(category)
                : available != null && available ? furnitureService.getAvailableFurniture()
                : furnitureService.getAllFurniture());
        model.addAttribute("categories", Furniture.FurnitureCategory.values());
        model.addAttribute("selectedCategory", category);
        model.addAttribute("showAvailable", available);
        model.addAttribute("newFurniture", new Furniture());
        model.addAttribute("conditions", Furniture.FurnitureCondition.values());
        model.addAttribute("bedSizes", Furniture.BedSize.values());
        model.addAttribute("page", "furniture");
        return "furniture";
    }

    @GetMapping("/rentals")
    public String rentals(
            @RequestParam(required = false) Rental.RentalStatus status,
            Model model) {

        model.addAttribute("rentals",
                status != null
                    ? rentalService.getAllRentals().stream().filter(r -> r.getStatus() == status).toList()
                    : rentalService.getAllRentals());
        model.addAttribute("statuses", Rental.RentalStatus.values());
        model.addAttribute("selectedStatus", status);
        model.addAttribute("furniture", furnitureService.getAvailableFurniture());
        model.addAttribute("page", "rentals");
        return "rentals";
    }

    @GetMapping("/rentals/{orderNo}")
    public String rentalDetail(@PathVariable String orderNo, Model model) {
        Rental rental = rentalService.getRentalByOrderNumber(orderNo);
        model.addAttribute("rental", rental);
        model.addAttribute("conditions", Furniture.FurnitureCondition.values());
        model.addAttribute("page", "rentals");
        return "rental-detail";
    }
}
