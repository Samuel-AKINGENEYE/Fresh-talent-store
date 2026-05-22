// Mock Email Service - Replace with Resend later
export async function sendMockOrderEmail(order: any, items: any[], user: any, address: any) {
  console.log('📧 MOCK EMAIL SENT (Replace with real Resend API)');
  console.log('================================================');
  console.log('To:', user.email);
  console.log('Subject:', `Order Confirmed #${order.order_number} - Fresh Talent Store`);
  console.log('Order Total:', `RWF ${order.total.toLocaleString()}`);
  console.log('Items:', items.length);
  console.log('Delivery to:', address?.address_line1);
  console.log('================================================');
  console.log('🔧 To enable real emails:');
  console.log('   1. Sign up at https://resend.com');
  console.log('   2. Get API key');
  console.log('   3. Add RESEND_API_KEY to .env.local');
  console.log('   4. Replace this mock with real implementation');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true, mock: true };
}

// Mock Email API handler
export async function handleMockEmail(request: Request) {
  const { order, items, user, address } = await request.json();
  await sendMockOrderEmail(order, items, user, address);
  return Response.json({ success: true, mock: true, message: 'Mock email sent (replace with real API)' });
}
