'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Share2, Globe, MessageCircle } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/products',    label: 'Shop All Products' },
    { href: '/flash-sales', label: 'Flash Sales'        },
    { href: '/track-order', label: 'Track Order'        },
    { href: '/about',       label: 'About Us'           },
  ];

  const accountLinks = [
    { href: '/account',  label: 'My Account'     },
    { href: '/cart',     label: 'Shopping Cart'  },
    { href: '/wishlist', label: 'Wishlist'        },
    { href: '/register', label: 'Create Account' },
  ];

  const socials = [
    { Icon: Share2,        label: 'Facebook',  href: '#' },
    { Icon: Globe,         label: 'Instagram', href: '#' },
    { Icon: MessageCircle, label: 'Twitter',   href: '#' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400">

      {/* Main content */}
      <div className="container mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand */}
          <div className="space-y-5">
            <Logo size="md" onDark />
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Kigali&apos;s premier destination for premium electronics. Quality gear,
              fast delivery, trusted service.
            </p>
            <div className="flex gap-2">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-white flex items-center gap-2 group transition-colors duration-150"
                  >
                    <span className="h-px w-3 bg-blue-600 group-hover:w-5 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wide">My Account</h4>
            <ul className="space-y-3">
              {accountLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-white flex items-center gap-2 group transition-colors duration-150"
                  >
                    <span className="h-px w-3 bg-amber-500 group-hover:w-5 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                Kigali, Rwanda
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                <a href="tel:+250790663921" className="text-slate-500 hover:text-white transition-colors">
                  +250 790 663 921
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <a href="mailto:info@freshtalent.rw" className="text-slate-500 hover:text-white transition-colors">
                  info@freshtalent.rw
                </a>
              </li>
            </ul>

            <a
              href="https://wa.me/250790663921?text=Hi!%20I'm%20interested%20in%20your%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 bg-emerald-600/15 border border-emerald-600/25 text-emerald-400 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-600/25 transition-all duration-200"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>&copy; {currentYear} Fresh Talent Store. All rights reserved.</p>
          <p>Made with ♥ in Kigali, Rwanda 🇷🇼</p>
        </div>
      </div>
    </footer>
  );
}
