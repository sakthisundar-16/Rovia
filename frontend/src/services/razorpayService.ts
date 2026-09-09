/**
 * Razorpay Payment Gateway Integration Service
 * Configured with Test API Key: rzp_test_SZ3DwXBVvicyTo
 */

export const RAZORPAY_TEST_KEY_ID = 'rzp_test_SZ3DwXBVvicyTo';

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayOptions {
  amountInRupees: number;
  orderName: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onDismiss?: () => void;
  onError?: (error: any) => void;
}

/**
 * Dynamically loads the Razorpay checkout script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Launches the Razorpay checkout popup
 */
export async function openRazorpayCheckout({
  amountInRupees,
  orderName,
  description,
  prefill,
  notes,
  onSuccess,
  onDismiss,
  onError
}: RazorpayOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !(window as any).Razorpay) {
    if (onError) {
      onError(new Error('Razorpay SDK could not be loaded. Check internet connection.'));
    }
    return;
  }

  const options: any = {
    key: RAZORPAY_TEST_KEY_ID,
    amount: Math.round(amountInRupees * 100), // Razorpay accepts amounts in paise (1 INR = 100 paise)
    currency: 'INR',
    name: 'ROVIA Rentals',
    description: description || orderName,
    image: '/rovia_logo.jpg',
    handler: function (response: RazorpayPaymentSuccessResponse) {
      if (response && response.razorpay_payment_id) {
        onSuccess(response);
      }
    },
    prefill: {
      name: prefill?.name || 'ROVIA Verified Customer',
      email: prefill?.email || 'customer@rovia.io',
      contact: prefill?.contact || '+91 98765 43210',
    },
    notes: {
      platform: 'ROVIA Rental Management System',
      ...notes
    },
    theme: {
      color: '#1C1818',
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      }
    }
  };

  const rzp = new (window as any).Razorpay(options);

  if (onError) {
    rzp.on('payment.failed', function (response: any) {
      onError(response.error);
    });
  }

  rzp.open();
}
