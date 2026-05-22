// Africa's Talking SMS service for Rwanda order notifications

interface SMSSendParams {
  to: string;
  message: string;
  type?: 'order_confirmation' | 'shipping_update' | 'delivery_confirmation';
}

function formatRwandaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('250')) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+250${digits.slice(1)}`;
  if (digits.length === 9) return `+250${digits}`;
  return `+${digits}`;
}

export async function sendSMS({ to, message }: SMSSendParams): Promise<{ success: boolean; dev?: boolean; error?: string }> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME ?? 'freshtalentstore';

  if (!apiKey || apiKey.startsWith('AT_XXXX')) {
    console.log('📱 [DEV] SMS would be sent to:', to);
    console.log('   Message:', message);
    return { success: true, dev: true };
  }

  try {
    // Dynamic require so the module is only loaded when the key is present
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AfricasTalking = require('africastalking');
    const at = AfricasTalking({ apiKey, username });
    const sms = at.SMS;

    const response = await sms.send({
      to: [formatRwandaPhone(to)],
      message,
      from: 'FreshTalent',
    });

    const recipient = response?.SMSMessageData?.Recipients?.[0];
    if (recipient?.status === 'Success') {
      return { success: true };
    }
    console.error('AT SMS error:', response);
    return { success: false, error: recipient?.status ?? 'Unknown AT error' };
  } catch (err: any) {
    console.error('AT SMS exception:', err);
    return { success: false, error: err.message };
  }
}

export function getOrderStatusMessage(orderNumber: string, status: string, total: number): string {
  const messages: Record<string, string> = {
    pending: `Fresh Talent Store: Order #${orderNumber} received. Total: RWF ${total.toLocaleString()}. We'll notify you once processed.`,
    processing: `Fresh Talent Store: Order #${orderNumber} is being processed. Expected delivery in 24-48 hours.`,
    shipped: `Fresh Talent Store: Order #${orderNumber} has been shipped and is on its way to you!`,
    delivered: `Fresh Talent Store: Order #${orderNumber} delivered! Thank you for shopping with us.`,
    cancelled: `Fresh Talent Store: Order #${orderNumber} has been cancelled. Refunds processed within 5-7 business days.`,
  };
  return messages[status] ?? `Order #${orderNumber} updated to: ${status}`;
}

export function getCODVerificationMessage(code: string): string {
  return `Fresh Talent Store: Your verification code is ${code}. Valid for 5 minutes. Do not share this code.`;
}

export function getDeliveryReminderMessage(orderNumber: string, estimatedDate: string): string {
  return `Fresh Talent Store: Order #${orderNumber} is scheduled for delivery on ${estimatedDate}. Please be available to receive it.`;
}
