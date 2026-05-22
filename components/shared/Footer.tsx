'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send, Smartphone, Zap } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-white">Fresh Talent</span>
              <span className="text-sm text-orange-500">Store</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted electronics store in Kigali, Rwanda. Quality products, fast delivery, great prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/smartphones" className="text-gray-400 hover:text-white transition-colors">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/category/laptops" className="text-gray-400 hover:text-white transition-colors">
                  Laptops
                </Link>
              </li>
              <li>
                <Link href="/category/audio" className="text-gray-400 hover:text-white transition-colors">
                  Audio
                </Link>
              </li>
              <li>
                <Link href="/category/accessories" className="text-gray-400 hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/category/wearables" className="text-gray-400 hover:text-white transition-colors">
                  Wearables
                </Link>
              </li>
              <li>
                <Link href="/category/gaming" className="text-gray-400 hover:text-white transition-colors">
                  Gaming
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  KG 123 St, Kigali<br />
                  Rwanda
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-400">+250 788 123 456</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-400">info@freshtalent.rw</span>
              </li>
              <li className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <a 
                  href="https://wa.me/250788123456" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
            
            {/* Working Hours */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-white text-sm font-semibold mb-2">Working Hours</h4>
              <p className="text-gray-400 text-xs">Monday - Friday: 8:00 AM - 8:00 PM</p>
              <p className="text-gray-400 text-xs">Saturday: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-400 text-xs">Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white font-semibold mb-2">Subscribe to our Newsletter</h3>
              <p className="text-gray-400 text-sm">Get the latest deals and updates straight to your inbox</p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                &copy; {currentYear} Fresh Talent Store. All rights reserved. Kigali, Rwanda
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Payment Methods:</span>
              <div className="flex gap-2">
                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">MTN MoMo</span>
                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Airtel Money</span>
                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">VISA</span>
                <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
