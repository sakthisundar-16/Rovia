# ROVIA - Intelligent Rental Operations Platform

## Documentation

### Product
What Rovia rents. A Product represents the rentable product TYPE, not an individual physical item (e.g., Sony Camera).

### ProductAsset
The actual physical item. Each asset represents a unique physical unit (e.g., CAM-001) tied to a specific Product.

### Availability
Whether a physical asset can be allocated for a requested period. Availability considers current asset status, maintenance state, and future rental date overlapping rules. 
The boundary rule uses `[start, end)` (start inclusive, end exclusive) to avoid double booking.

### Asset Passport
The digital identity/history of a physical rental item. Accessible securely via an opaque QR Token (e.g., ROVIA-ASSET-XXX). It contains the current asset status, condition, rental count, and maintenance history.

### Asset Lifecycle
The strict state machine governing an asset's journey:
AVAILABLE → RESERVED → READY_FOR_PICKUP → ACTIVE → RETURN_INSPECTION → AVAILABLE / MAINTENANCE → ...
