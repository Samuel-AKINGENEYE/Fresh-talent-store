// Push Notification Service
// Uses Web Push API - Ready for VAPID keys

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Request permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log('Push notifications not supported');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Send notification
export function sendNotification(notification: PushNotification): void {
  if (!isNotificationSupported()) return;
  
  if (Notification.permission === 'granted') {
    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icon-192.png',
      badge: notification.badge || '/badge-72.png',
      tag: notification.tag,
      data: { url: notification.url },
    };
    
    const notif = new Notification(notification.title, options);
    
    notif.onclick = (event) => {
      event.preventDefault();
      if (notification.url) {
        window.open(notification.url, '_blank');
      }
      notif.close();
    };
    
    console.log('🔔 Push notification sent:', notification.title);
  } else {
    console.log('Notification permission not granted');
  }
}

// Send order status notification
export function sendOrderNotification(orderNumber: string, status: string, total: number) {
  const messages: Record<string, { title: string; body: string }> = {
    processing: {
      title: '🔄 Order Processing',
      body: `Order #${orderNumber} is being processed. Amount: RWF ${total.toLocaleString()}`,
    },
    shipped: {
      title: '📦 Order Shipped',
      body: `Great news! Order #${orderNumber} has been shipped and is on its way!`,
    },
    delivered: {
      title: '✅ Order Delivered',
      body: `Order #${orderNumber} has been delivered. Thank you for shopping with us!`,
    },
  };
  
  const message = messages[status];
  if (message) {
    sendNotification({
      title: message.title,
      body: message.body,
      url: `/account/orders`,
      tag: `order-${orderNumber}`,
    });
  }
}

// Send flash sale notification
export function sendFlashSaleNotification(saleName: string, discount: number, endTime: Date) {
  const hoursLeft = Math.ceil((endTime.getTime() - Date.now()) / (1000 * 60 * 60));
  
  sendNotification({
    title: `⚡ Flash Sale: ${saleName}`,
    body: `${discount}% OFF for the next ${hoursLeft} hours! Shop now before it ends.`,
    url: '/flash-sales',
    tag: 'flash-sale',
  });
}

// Send welcome notification
export function sendWelcomeNotification(userName: string) {
  sendNotification({
    title: '👋 Welcome to Fresh Talent Store!',
    body: `Thanks for joining, ${userName}! Check out our latest deals.`,
    url: '/products',
    tag: 'welcome',
  });
}

// Send cart reminder
export function sendCartReminder(itemCount: number, total: number) {
  sendNotification({
    title: '🛒 Don\'t forget your items!',
    body: `You have ${itemCount} item(s) worth RWF ${total.toLocaleString()} in your cart. Complete your purchase now!`,
    url: '/cart',
    tag: 'cart-reminder',
  });
}
