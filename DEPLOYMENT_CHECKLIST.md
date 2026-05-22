# Production Deployment Checklist

## Before Going Live

### 1. Email (Resend)
- [ ] Sign up at https://resend.com
- [ ] Get API key
- [ ] Add RESEND_API_KEY to .env.local and Vercel
- [ ] Verify sender domain
- [ ] Set EMAIL_FROM to your verified domain

### 2. Payments (Flutterwave)
- [ ] Sign up at https://dashboard.flutterwave.com
- [ ] Get Public Key and Secret Key
- [ ] Add to .env.local and Vercel
- [ ] Configure webhooks for payment callbacks
- [ ] Test in sandbox mode first

### 3. SMS (Africa's Talking - Optional)
- [ ] Sign up at https://africastalking.com
- [ ] Get API credentials for Rwanda
- [ ] Add to .env.local and Vercel
- [ ] Purchase SMS credits

### 4. Switch from Mock to Production
- [ ] Set `productionMode: true` in lib/config.ts
- [ ] Set `mockMode: false` in lib/config.ts
- [ ] Replace all mock services with real implementations

### 5. Environment Variables Needed
```env
# Production
PRODUCTION_MODE=true
MOCK_MODE=false

# Email
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@freshtalent.rw

# Payment
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx

# SMS (Optional)
AFRICASTALKING_API_KEY=xxxxx
AFRICASTALKING_USERNAME=sandbox
6. Testing Checklist
Email sending works

Payment processing works

SMS notifications work

All webhooks are configured

Error handling works

Fallback to COD works
