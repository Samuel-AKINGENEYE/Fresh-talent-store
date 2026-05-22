// SMS Service - Ready for Africa's Talking API integration
// Replace mock with real API when you have credentials

interface SMSSendParams {
  to: string;
  message: string;
  type?: 'order_confirmation' | 'shipping_update' | 'delivery_confirmation';
}

export async function sendSMS({ to, message, type = 'order_confirmation' }: SMSSendParams) {
  // Mock implementation for development
  console.log('📱 ================================================');
  console.log('📱 SMS SERVICE (Mock Mode - Replace with Africa\'s Talking)');
  console.log('📱 ================================================');
  console.log(`📱 To: ${to}`);
  console.log(`📱 Type: ${type}`);
  console.log(`📱 Message: ${message}`);
  console.log('📱 ================================================');
  console.log('🔧 To enable real SMS:');
  console.log('   1. Sign up at https://africastalking.com');
  console.log('   2. Get API credentials for Rwanda');
  console.log('   3. Add AFRICASTALKING_API_KEY to .env.local');
  console.log('   4. Replace this mock with real implementation');
  console.log('📱 ================================================\n');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true, mock: true, message: 'SMS sent (mock mode)' };
}

// Order status update templates
export function getOrderStatusMessage(orderNumber: string, status: string, total: number) {
  const messages = {
    pending: `Fresh Talent Store: Order #${orderNumber} received. Amount: RWF ${total.toLocaleString()}. We'll notify you once processed.`,
    processing: `Fresh Talent Store: Order #${orderNumber} is being processed. Expected delivery in 24-48 hours.`,
    shipped: `Fresh Talent Store: Great news! Order #${orderNumber} has been shipped. You'll receive it within 24 hours.`,
    delivered: `Fresh Talent Store: Order #${orderNumber} has been delivered! Thank you for shopping with us. Rate your experience: https://fresh-talent-store.vercel.app/orders/${orderNumber}/review`,
    cancelled: `Fresh Talent Store: Order #${orderNumber} has been cancelled. Any charges will be refunded within 5-7 business days.`,
  };
  
  return messages[status as keyof typeof messages] || `Order #${orderNumber} status updated to: ${status}`;
}

// COD verification message
export function getCODVerificationMessage(code: string) {
  return `Fresh Talent Store: Your verification code is ${code}. Valid for 5 minutes. Do not share this code with anyone.`;
}

// Delivery reminder
export function getDeliveryReminderMessage(orderNumber: string, estimatedDate: string) {
  return `Fresh Talent Store: Reminder - Order #${orderNumber} is scheduled for delivery on ${estimatedDate}. Please ensure someone is available to receive it.`;
}
