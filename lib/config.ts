// Configuration file - Replace with your actual API keys when ready

export const config = {
  // Set to true when you have real API keys
  productionMode: false,
  
  // Mock mode (development)
  mockMode: true,
  
  // Email
  email: {
    provider: 'mock', // Change to 'resend' when ready
    resendApiKey: process.env.RESEND_API_KEY || '',
  },
  
  // Payment
  payment: {
    provider: 'mock', // Change to 'flutterwave' when ready
    flutterwavePublicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
    flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  },
  
  // SMS
  sms: {
    provider: 'mock', // Change to 'africastalking' when ready
    africastalkingApiKey: process.env.AFRICASTALKING_API_KEY || '',
  },
};

export const isMockMode = config.mockMode;
export const isProduction = config.productionMode;
