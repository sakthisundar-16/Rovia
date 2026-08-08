import uuid
from decimal import Decimal
from typing import Tuple

class DemoPaymentProvider:
    """
    Simulates a payment gateway without hitting any external APIs.
    """
    
    @staticmethod
    def initiate_payment(amount: Decimal, currency: str, internal_reference: str) -> Tuple[str, str]:
        """
        Simulates creating an order on a payment gateway.
        Returns (provider_reference, redirect_url)
        """
        provider_ref = f"DEMO_ORD_{uuid.uuid4().hex.upper()}"
        redirect_url = f"https://demo-gateway.rovia.local/pay/{provider_ref}"
        return provider_ref, redirect_url

    @staticmethod
    def verify_payment(provider_reference: str) -> bool:
        """
        Simulates checking if a payment succeeded. 
        In demo mode, we drive this via our simulate endpoints, so this could just return True 
        or check a mocked Redis key. We will bypass this directly via simulate endpoints for Phase 5.
        """
        return True

    @staticmethod
    def refund_payment(provider_reference: str, amount: Decimal) -> str:
        """
        Simulates refunding a payment on the gateway.
        Returns the refund_reference.
        """
        return f"DEMO_RFD_{uuid.uuid4().hex.upper()}"
