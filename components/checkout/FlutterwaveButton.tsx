'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface FlutterwaveConfig {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: { email: string; phone_number: string; name: string };
  customizations: { title: string; description: string };
  callback: (response: { transaction_id: number; status: string }) => void;
  onclose: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: FlutterwaveConfig) => void;
  }
}

interface Props {
  amount: number;
  email: string;
  phone: string;
  name: string;
  orderId: string;
  paymentMethod: 'mtn_momo' | 'airtel_money';
  onSuccess: (transactionId: number) => void;
  onFailure: () => void;
  disabled?: boolean;
}

export function FlutterwaveButton({
  amount, email, phone, name, orderId, paymentMethod, onSuccess, onFailure, disabled,
}: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

  // If SDK is already loaded (e.g. after navigation), mark ready
  useEffect(() => {
    if (typeof window !== 'undefined' && window.FlutterwaveCheckout) {
      setSdkReady(true);
    }
  }, []);

  const handlePay = () => {
    if (!window.FlutterwaveCheckout) return;
    setProcessing(true);

    const paymentOptions = paymentMethod === 'mtn_momo' ? 'mobilemoneyrwanda' : 'mobilemoneyrwanda';

    window.FlutterwaveCheckout({
      tx_ref: `FTS-${orderId}-${Date.now()}`,
      amount,
      currency: 'RWF',
      payment_options: paymentOptions,
      customer: { email, phone_number: phone, name },
      customizations: {
        title: 'Fresh Talent Store',
        description: 'Order payment',
      },
      callback: (response) => {
        setProcessing(false);
        if (response.status === 'successful') {
          onSuccess(response.transaction_id);
        } else {
          onFailure();
        }
      },
      onclose: () => {
        setProcessing(false);
      },
    });
  };

  const label = paymentMethod === 'mtn_momo' ? 'Pay with MTN MoMo' : 'Pay with Airtel Money';

  return (
    <>
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="lazyOnload"
        onLoad={() => setSdkReady(true)}
      />
      <button
        onClick={handlePay}
        disabled={disabled || !sdkReady || processing || !publicKey || publicKey.includes('XXXX')}
        className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing…' : !sdkReady ? 'Loading payment…' : label}
      </button>
      {(!publicKey || publicKey.includes('XXXX')) && (
        <p className="text-xs text-amber-600 mt-2 text-center">
          Flutterwave keys not configured — add NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY to .env.local
        </p>
      )}
    </>
  );
}
