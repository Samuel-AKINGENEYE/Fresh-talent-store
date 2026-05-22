'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Share2, Globe, MessageCircle } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/products', label: 'Shop All' },
    { href: '/flash-sales', label: 'Flash Sales' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/about', label: 'About Us' },
  ];

  const supportLinks = [
    { href: '/account', label: 'My Account' },
    { href: '/cart', label: 'Shopping Cart' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/register', label: 'Create Account' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Top strip */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 lg:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand column */}
            <div className="space-y-4">
              <Logo size="md" onDark />
              <p className="text-sm leading-relaxed max-w-xs">
                Kigali&apos;s premier destination for premium electronics. Quality gear, fast delivery, trusted service.
              </p>
              <div className="flex gap-3 pt-1">
                {[
                  { Icon: Share2,        label: 'Facebook'  },
                  { Icon: Globe,         label: 'Instagram' },
                  { Icon: MessageCircle, label: 'Twitter'   },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Quick Links</h4>
              <ul className="space-y-2.5">
                {quickLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                    >
                      <span className="h-1 w-1 rounded-full bg-blue-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Customer Support</h4>
              <ul className="space-y-2.5">
                {supportLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                    >
                      <span className="h-1 w-1 rounded-full bg-orange-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  Kigali, Rwanda
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                  <a href="tel:+250790663921" className="hover:text-white transition-colors">+250 790 663 921</a>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                  <a href="mailto:info@freshtalent.rw" className="hover:text-white transition-colors">info@freshtalent.rw</a>
                </li>
              </ul>

              <a
                href="https://wa.me/250790663921?text=Hi!%20I'm%20interested%20in%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 bg-green-600/20 border border-green-600/30 text-green-400 text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-600/30 hover:text-green-300 transition-all duration-200"
              >
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                WhatsApp: +250 790 663 921
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>&copy; {currentYear} Fresh Talent Store. All rights reserved.</p>
        <p>Made with ♥ in Kigali, Rwanda 🇷🇼</p>
      </div>
    </footer>
  );
}
