import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

// Stripe test key
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

// Mock backend endpoint - in production, this would be your actual server
const API_URL = 'https://your-backend.com/api';

export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    // In a real app, this would call your backend
    // For demo, we'll simulate the response
    
    // Your backend would:
    // 1. Create a payment intent with Stripe
    // 2. Return the client secret
    
    // Mock response
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_test`,
      paymentIntentId: `pi_mock_${Date.now()}`,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Initialize payment sheet
export const initializePaymentSheet = async (
  amount: number,
  currency: string = 'usd',
  customerEmail?: string
) => {
  try {
    const { clientSecret } = await createPaymentIntent(amount, currency);
    
    return {
      clientSecret,
      merchantDisplayName: 'DSCVR Events',
      customerEmail,
      // Additional config for Apple Pay / Google Pay
      applePay: {
        merchantCountryCode: 'US',
      },
      googlePay: {
        merchantCountryCode: 'US',
        testEnv: true, // Remove in production
      },
    };
  } catch (error) {
    console.error('Error initializing payment sheet:', error);
    throw error;
  }
};
