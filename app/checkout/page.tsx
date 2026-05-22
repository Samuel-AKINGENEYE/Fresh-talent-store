'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Check, Truck, CreditCard, ClipboardList, MapPin, Smartphone, Building2, ChevronRight, Shield, Clock, MessageCircle } from 'lucide-react';

type Step = 'address' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // COD verification states
  const [showCODVerification, setShowCODVerification] = useState(false);
  const [codPhone, setCodPhone] = useState('');
  const [codOtp, setCodOtp] = useState('');
  const [codOtpSent, setCodOtpSent] = useState(false);
  const [codOtpVerified, setCodOtpVerified] = useState(false);
  const [codCountdown, setCodCountdown] = useState(0);
  const [codError, setCodError] = useState('');

  // Address form state
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: 'Kigali',
    sector: '',
    is_default: false,
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [items, router, loading]);

  // Countdown timer for OTP
  useEffect(() => {
    if (codCountdown > 0) {
      const timer = setTimeout(() => setCodCountdown(codCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codCountdown]);

  // Load user addresses
  useEffect(() => {
    async function loadAddresses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirectTo=/checkout');
        return;
      }

      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(data || []);
      const defaultAddress = data?.find(a => a.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setCodPhone(defaultAddress.phone || '');
      }
    }
    loadAddresses();
  }, [router]);

  const deliveryFee = subtotal > 100000 ? 0 : 5000;
  const total = subtotal + deliveryFee;

  const saveAddress = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('addresses')
      .insert({
        ...addressForm,
        user_id: user?.id,
      });

    if (error) {
      alert('Error saving address: ' + error.message);
    } else {
      setShowAddressForm(false);
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id);
      setAddresses(data || []);
      if (data?.[0]) {
        setSelectedAddressId(data[0].id);
        setCodPhone(data[0].phone || '');
      }
      setAddressForm({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: 'Kigali',
        sector: '',
        is_default: false,
      });
    }
    setLoading(false);
  };

  // Send COD verification OTP
  const sendCodOtp = async () => {
    if (!codPhone || codPhone.length < 10) {
      setCodError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setCodError('');
    
    // Generate random 6-digit OTP (in production, this would be sent via SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in localStorage for verification (in production, use Supabase or SMS service)
    localStorage.setItem('cod_otp', otp);
    localStorage.setItem('cod_otp_expiry', (Date.now() + 5 * 60 * 1000).toString());
    
    // Simulate SMS sending (in production, integrate with Africa's Talking API)
    console.log(`[DEV] COD Verification OTP for ${codPhone}: ${otp}`);
    
    setCodOtpSent(true);
    setCodCountdown(60);
    alert(`Demo: Your OTP is ${otp} (in production, this will be sent via SMS)`);
    setLoading(false);
  };

  // Verify COD OTP
  const verifyCodOtp = async () => {
    const storedOtp = localStorage.getItem('cod_otp');
    const expiry = localStorage.getItem('cod_otp_expiry');
    
    if (!storedOtp || !expiry) {
      setCodError('Please request a new OTP');
      return;
    }
    
    if (Date.now() > parseInt(expiry)) {
      setCodError('OTP has expired. Please request a new one');
      localStorage.removeItem('cod_otp');
      localStorage.removeItem('cod_otp_expiry');
      setCodOtpSent(false);
      return;
    }
    
    if (codOtp === storedOtp) {
      setCodOtpVerified(true);
      setShowCODVerification(false);
      setCodError('');
      // Clear OTP from storage
      localStorage.removeItem('cod_otp');
      localStorage.removeItem('cod_otp_expiry');
      // Proceed to review step
      setCurrentStep('review');
    } else {
      setCodError('Invalid OTP. Please try again');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    // For COD, require phone verification
    if (paymentMethod === 'cod' && !codOtpVerified) {
      setShowCODVerification(true);
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id,
        address_id: selectedAddressId,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        discount: 0,
        total: total,
        guest_phone: selectedAddress?.phone,
        guest_email: user?.email,
      })
      .select()
      .single();

    if (orderError) {
      alert('Error creating order: ' + orderError.message);
      setLoading(false);
      return;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: (item.product?.price || 0) + (item.variant?.price_adjustment || 0),
      product_name: item.product?.name || '',
      product_image: item.product?.images?.[0] || '',
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      alert('Error creating order items: ' + itemsError.message);
    } else {
      await clearCart();
      router.push(`/checkout/confirmation?order=${order.id}`);
    }

    setLoading(false);
  };

  const steps = [
    { id: 'address', name: 'Delivery Address', icon: MapPin },
    { id: 'payment', name: 'Payment Method', icon: CreditCard },
    { id: 'review', name: 'Review Order', icon: ClipboardList },
  ];

  const getStepStatus = (stepId: Step) => {
    if (currentStep === stepId) return 'current';
    if ((currentStep === 'payment' && stepId === 'address') ||
        (currentStep === 'review' && (stepId === 'address' || stepId === 'payment'))) {
      return 'completed';
    }
    return 'upcoming';
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, idx) => {
              const status = getStepStatus(step.id as Step);
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${status === 'completed' ? 'bg-green-600 text-white' : ''}
                      ${status === 'current' ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                      ${status === 'upcoming' ? 'bg-gray-300 text-gray-600' : ''}
                    `}>
                      {status === 'completed' ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${status === 'current' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {step.name}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-16 h-0.5 bg-gray-300 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Step 1: Address */}
              {currentStep === 'address' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </h2>
                  
                  {addresses.length > 0 && !showAddressForm && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <label key={addr.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => {
                              setSelectedAddressId(addr.id);
                              setCodPhone(addr.phone || '');
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{addr.full_name}</div>
                            <div className="text-sm text-gray-600">{addr.phone}</div>
                            <div className="text-sm text-gray-600">{addr.address_line1}</div>
                            {addr.address_line2 && <div className="text-sm text-gray-600">{addr.address_line2}</div>}
                            <div className="text-sm text-gray-600">{addr.city}, {addr.sector}</div>
                            {addr.is_default && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block">
                                Default
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}

                  {showAddressForm && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={addressForm.full_name}
                        onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={addressForm.address_line1}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={addressForm.address_line2}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          className="w-full px-3 py-2 border rounded-lg"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Sector/Area"
                          className="w-full px-3 py-2 border rounded-lg"
                          value={addressForm.sector}
                          onChange={(e) => setAddressForm({ ...addressForm, sector: e.target.value })}
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                        />
                        <span>Set as default address</span>
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={saveAddress}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {!showAddressForm && addresses.length > 0 && (
                    <button
                      onClick={() => setCurrentStep('payment')}
                      disabled={!selectedAddressId}
                      className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                      Continue to Payment
                      <ChevronRight className="inline h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 'payment' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-3">
                    {/* COD Option with details */}
                    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          Cash on Delivery (COD)
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Recommended</span>
                        </div>
                        <div className="text-sm text-gray-600">Pay when you receive your order</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          Secure & verified
                          <Clock className="h-3 w-3 ml-2" />
                          Pay at delivery
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="mtn_momo"
                        checked={paymentMethod === 'mtn_momo'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">MTN Mobile Money</div>
                        <div className="text-sm text-gray-600">Pay using MTN MoMo</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="airtel_money"
                        checked={paymentMethod === 'airtel_money'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Airtel Money</div>
                        <div className="text-sm text-gray-600">Pay using Airtel Money</div>
                      </div>
                    </label>
                  </div>

                  {/* COD Info Box */}
                  {paymentMethod === 'cod' && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">How COD works:</span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1 ml-6 list-disc">
                        <li>You'll receive an SMS with verification code</li>
                        <li>Verify your phone number to confirm the order</li>
                        <li>Pay in cash when the delivery arrives</li>
                        <li>Inspect the product before payment</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCurrentStep('address')}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (paymentMethod === 'cod') {
                          setShowCODVerification(true);
                        } else {
                          setCurrentStep('review');
                        }
                      }}
                      disabled={!paymentMethod}
                      className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                      Continue
                      <ChevronRight className="inline h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* COD Verification Modal */}
              {showCODVerification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="text-center mb-4">
                      <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <h3 className="text-xl font-semibold">Verify Your Phone Number</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        We'll send a verification code to confirm your order
                      </p>
                    </div>
                    
                    {!codOtpSent ? (
                      <>
                        <input
                          type="tel"
                          placeholder="Phone number (e.g., 0788 123 456)"
                          value={codPhone}
                          onChange={(e) => setCodPhone(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg mb-4"
                        />
                        {codError && <p className="text-red-600 text-sm mb-3">{codError}</p>}
                        <button
                          onClick={sendCodOtp}
                          disabled={loading}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                          Send Verification Code
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={codOtp}
                          onChange={(e) => setCodOtp(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg mb-2"
                          maxLength={6}
                        />
                        {codError && <p className="text-red-600 text-sm mb-3">{codError}</p>}
                        <button
                          onClick={verifyCodOtp}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                        >
                          Verify & Continue
                        </button>
                        {codCountdown > 0 ? (
                          <p className="text-center text-sm text-gray-500 mt-3">
                            Resend code in {codCountdown}s
                          </p>
                        ) : (
                          <button
                            onClick={sendCodOtp}
                            className="w-full text-blue-600 text-sm mt-3 hover:underline"
                          >
                            Resend Code
                          </button>
                        )}
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        setShowCODVerification(false);
                        setCodOtpSent(false);
                        setCodOtp('');
                        setCodError('');
                      }}
                      className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 'review' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Review Your Order
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="font-medium mb-2">Delivery Address</h3>
                      {addresses.find(a => a.id === selectedAddressId) && (
                        <div>
                          <p>{addresses.find(a => a.id === selectedAddressId)?.full_name}</p>
                          <p className="text-sm text-gray-600">{addresses.find(a => a.id === selectedAddressId)?.phone}</p>
                          <p className="text-sm text-gray-600">{addresses.find(a => a.id === selectedAddressId)?.address_line1}</p>
                          <p className="text-sm text-gray-600">{addresses.find(a => a.id === selectedAddressId)?.city}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-b pb-3">
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <p className="text-sm text-gray-600 capitalize">{paymentMethod.replace('_', ' ')}</p>
                      {paymentMethod === 'cod' && codOtpVerified && (
                        <p className="text-xs text-green-600 mt-1">✓ Phone verified</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Order Items ({items.length})</h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-1">
                            <span>{item.product?.name} x{item.quantity}</span>
                            <span>RWF {((item.product?.price || 0) + (item.variant?.price_adjustment || 0)) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>RWF {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>RWF {deliveryFee.toLocaleString()}</span>
                  )}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">RWF {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {paymentMethod === 'cod' && (
                <div className="bg-green-50 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Pay on Delivery</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">No payment needed now</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
