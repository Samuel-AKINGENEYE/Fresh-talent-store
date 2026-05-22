import { NextResponse } from 'next/server';

// Mock Mailchimp service - Replace with real API
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    
    console.log('📧 Newsletter Subscription (Mock Mode)');
    console.log('======================================');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name || 'Not provided'}`);
    console.log('======================================');
    console.log('🔧 To enable real Mailchimp:');
    console.log('   1. Sign up at https://mailchimp.com');
    console.log('   2. Get API key and Audience ID');
    console.log('   3. Add MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID to .env.local');
    console.log('======================================\n');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({ 
      success: true, 
      mock: true, 
      message: 'Subscribed (mock mode - configure Mailchimp for production)' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
