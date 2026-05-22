// Mock SMS Service - Replace with Africa's Talking later
export async function sendMockSMS(phone: string, message: string) {
  console.log('📱 MOCK SMS SENT (Replace with Africa\'s Talking)');
  console.log('================================================');
  console.log('To:', phone);
  console.log('Message:', message);
  console.log('================================================');
  console.log('🔧 To enable real SMS:');
  console.log('   1. Sign up at https://africastalking.com');
  console.log('   2. Get API credentials for Rwanda');
  console.log('   3. Add AFRICASTALKING_API_KEY to .env.local');
  console.log('   4. Replace this mock with real implementation');
  
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, mock: true };
}

// Mock COD OTP (already implemented in checkout)
export function generateMockOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
