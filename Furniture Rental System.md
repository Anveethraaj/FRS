# Furniture Rental System

## 1. Furniture Inventory

### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR1.1 | Support furniture types: Sofa, Table, Chair, Bed, Cabinet | High |
| FR1.2 | Each item has unique code, name, category, daily rate | High |
| FR1.3 | Track total furniture count with static variable | Medium |
| FR1.4 | Damage deposit percentage should be constant | Low |

### Implementation Approach
- Create an abstract Furniture class with a static counter for total items
- Define a final constant for damage deposit percentage (e.g., 20%)
- Create child classes: Sofa, Table, Chair, Bed, Cabinet
- Each child class overrides calculateRentalCost method differently
- Sofa: Add 15% for recliner feature, 10% discount for 30+ days
- Table: Add extra charge based on number of chairs included

---

## 2. Rental Operations

### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR2.1 | Customers can rent multiple furniture items | High |
| FR2.2 | Rental period with start and end dates | High |
| FR2.3 | Calculate rental cost based on duration and item type | High |
| FR2.4 | Support rental extension | Medium |
| FR2.5 | Process returns with condition inspection | High |

### Implementation Approach
- Create Rentable interface with methods: rent, isAvailable, markAsRented
- Create Returnable interface with methods: processReturn, calculateLateFee
- Use LinkedList for order queue (first-in-first-out processing)
- Calculate late fee as: number of days late multiplied by daily late fee rate

---

## 3. Damage Assessment

### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR3.1 | Inspect furniture condition on return | High |
| FR3.2 | Calculate damage cost based on damage type | High |
| FR3.3 | Deduct from deposit or charge customer | Medium |

### Implementation Approach
- Create DamageReport class with damage categories
- Each furniture type assesses damage differently (polymorphism)
- Sofa: Check for tears, stains, broken frame
- Table: Check for scratches, water damage, broken legs
- Compare condition at return with condition at rental

---

## 4. Exception Handling

| Scenario | Custom Exception to Create |
|----------|---------------------------|
| Item not in stock | ItemNotAvailableException |
| Rental is overdue | OverdueRentalException |
| Deposit amount insufficient | InsufficientDepositException |
| Invalid rental dates | InvalidRentalPeriodException |

### Implementation Approach
- Create a parent FurnitureRentalException class
- Each specific exception extends the parent
- Include helpful information like next available date or outstanding amount

---

## 5. Database Operations

| Operation | How to Implement |
|-----------|------------------|
| Store furniture | Create Furniture entity with category as String field (not inheritance) |
| Track rentals | Create Rental entity with furniture ID stored as Long |
| Find available items | Use repository method findByCategoryAndAvailableTrue |
| Generate reports | Use simple queries to get counts and totals |

### Entity Design (No Joins)
**Furniture Entity Fields:**
- id (auto-generated primary key)
- code (unique, e.g., "SOFA001")
- name (e.g., "Leather Recliner Sofa")
- category (String: "SOFA", "TABLE", "CHAIR", "BED", "CABINET")
- dailyRate
- available (boolean)
- condition (EXCELLENT, GOOD, FAIR)
- isRecliner (nullable, only for sofas)
- numberOfChairs (nullable, only for tables)
- size (nullable, only for beds: SINGLE, DOUBLE, QUEEN, KING)

**Rental Entity Fields:**
- id (auto-generated primary key)
- orderNumber (unique)
- customerId (store as Long)
- furnitureId (store as Long)
- startDate
- endDate
- totalCost
- deposit
- status (ACTIVE, RETURNED, OVERDUE)
- returnDate

---

## 6. REST API Endpoints

### Furniture Endpoints

| Endpoint | Method | What It Does |
|----------|--------|--------------|
| /api/v1/furniture | GET | Returns list of all furniture. Can filter by category (e.g., ?category=SOFA) or availability (e.g., ?available=true). Returns furniture with name, code, category, daily rate, and availability status. |
| /api/v1/furniture/available | GET | Returns furniture available for rent during a specific date range. Requires startDate and endDate query parameters. Optionally filter by category. Useful for customers planning ahead. |
| /api/v1/furniture/{code} | GET | Returns details of a single furniture item by its code. Includes all properties like condition, special features, and current availability. |

### Rental Endpoints

| Endpoint | Method | What It Does |
|----------|--------|--------------|
| /api/v1/rentals | POST | Creates a new rental order. Customer sends furniture ID, customer ID, start date, and end date. System calculates total cost, deposit amount, and generates order number. Returns created rental with HTTP 201 status. |
| /api/v1/rentals/{orderNo} | GET | Returns rental details including furniture info, rental period, cost breakdown, deposit amount, and current status. |
| /api/v1/rentals/{orderNo}/extend | PUT | Extends the rental period to a new end date. Customer sends the new end date. System recalculates total cost and returns updated rental. Only works if furniture is not already booked for the extension period. |
| /api/v1/rentals/{orderNo}/return | POST | Processes the furniture return. Customer sends condition report and any damage notes. System inspects condition, calculates any damage charges, compares with deposit, and returns summary showing final charges or refund amount. |
| /api/v1/rentals/{orderNo}/damage-report | POST | Submits a detailed damage report for the returned furniture. Includes damage type, severity, and repair cost estimate. |
| /api/v1/rentals/{orderNo}/invoice | GET | Downloads the rental invoice as a PDF file. Shows itemized costs, deposit, damage charges if any, and final amount. |

---

## 7. Collections to Use

| Collection Type | Where to Use |
|-----------------|--------------|
| ArrayList | Store all furniture inventory |
| LinkedList | Order processing queue (FIFO) |
| HashMap | Quick lookup by furniture code |
| TreeSet | Furniture sorted by rental rate |
| TreeMap | Rental history organized by date |
| Stack | Undo/redo operations |
| PriorityQueue | Process urgent returns first (by due date) |

---

## 8. Java 8 Features to Use

| Feature | Where to Use |
|---------|--------------|
| Stream filter | Find available furniture by category |
| Stream map | Convert Furniture entity to FurnitureDTO |
| Stream reduce | Calculate total rental value |
| Collectors.groupingBy | Group inventory by category |
| Optional | Safe retrieval when furniture may not exist |
| Lambda | Custom sorting comparators |
