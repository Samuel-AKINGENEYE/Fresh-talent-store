// Mock Payment Service - Replace with Flutterwave later
export async function processMockPayment(amount: number, method: string) {
  console.log('💳 MOCK PAYMENT PROCESSED (Replace with real Flutterwave)');
  console.log('================================================');
  console.log('Amount:', `RWF ${amount.toLocaleString()}`);
  console.log('Method:', method);
  console.log('Status:', 'SUCCESSFUL (MOCK)');
  console.log('Transaction ID:', `MOCK_${Date.now()}`);
  console.log('================================================');
  console.log('🔧 To enable real payments:');
  console.log('   1. Sign up at https://dashboard.flutterwave.com');
  console.log('   2. Get API keys');
  console.log('   3. Add FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY to .env.local');
  console.log('   4. Replace this mock with Flutterwave SDK');
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    transactionId: `MOCK_${Date.now()}`,
    amount: amount,
    currency: 'RWF',
    mock: true
  };
}

// Mock Flutterwave payment component
export const MockFlutterwavePayment = ({ amount, email, phone, name, onSuccess, onFailure }: any) => {
  const handleMockPayment = async () => {
    console.log('Processing mock payment...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSuccess(`MOCK_TXN_${Date.now()}`);
  };
  
  return (
    <button
      onClick={handleMockPayment}
      className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
    >
      Pay with Mobile Money (MOCK - Testing)
    </button>
  );
};
