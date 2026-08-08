from fastapi import HTTPException, status

class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code

class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "Invalid credentials", "INVALID_CREDENTIALS")

class EmailAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Email already exists", "EMAIL_ALREADY_EXISTS")

class OrganizationNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "Organization not found", "ORGANIZATION_NOT_FOUND")

class UserNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "User not found", "USER_NOT_FOUND")

class CustomerNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "Customer not found", "CUSTOMER_NOT_FOUND")

class AccountDisabledException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_403_FORBIDDEN, "Account disabled", "ACCOUNT_DISABLED")

class InvalidTokenException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "Invalid token", "INVALID_TOKEN")

class TokenExpiredException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "Token expired", "TOKEN_EXPIRED")

class ForbiddenException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_403_FORBIDDEN, "Access forbidden", "FORBIDDEN")

class TenantAccessDeniedException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_403_FORBIDDEN, "Tenant access denied", "TENANT_ACCESS_DENIED")

class ProductNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "Product not found", "PRODUCT_NOT_FOUND")

class AssetNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "Asset not found", "ASSET_NOT_FOUND")

class ProductInactiveException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Product is inactive", "PRODUCT_INACTIVE")

class AssetNotAvailableException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Asset is not available", "ASSET_NOT_AVAILABLE")

class InvalidAssetTransitionException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Invalid asset transition", "INVALID_ASSET_TRANSITION")

class DuplicateAssetCodeException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Duplicate asset code", "DUPLICATE_ASSET_CODE")

class DuplicateSerialNumberException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Duplicate serial number", "DUPLICATE_SERIAL_NUMBER")

class QrTokenNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "QR Token not found", "QR_TOKEN_NOT_FOUND")

class RentalNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "Rental not found", "RENTAL_NOT_FOUND")

class InvalidRentalTransitionException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Invalid rental transition", "INVALID_RENTAL_TRANSITION")

class InsufficientAssetAvailabilityException(AppException):
    def __init__(self, product_name: str):
        super().__init__(status.HTTP_400_BAD_REQUEST, f"Insufficient availability for product: {product_name}", "INSUFFICIENT_AVAILABILITY")

class InvalidRentalDatesException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Invalid rental dates. Start must be before end.", "INVALID_RENTAL_DATES")

class PastDatesProhibitedException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Rental start date cannot be in the past.", "PAST_DATES_PROHIBITED")

class PaymentFailedException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_400_BAD_REQUEST, "Payment failed", "PAYMENT_FAILED")

class DemoModeDisabledException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_403_FORBIDDEN, "Demo mode is disabled", "DEMO_MODE_DISABLED")

class PaymentNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "Payment not found", "PAYMENT_NOT_FOUND")

class DepositNotFoundException(AppException):
    def __init__(self):
        super().__init__(status.HTTP_404_NOT_FOUND, "Deposit not found", "DEPOSIT_NOT_FOUND")
