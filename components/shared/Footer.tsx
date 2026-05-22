export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-semibold text-white">Fresh Talent Store</h3>
            <p className="text-sm">Your trusted electronics store in Kigali, Rwanda.</p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>📍 Kigali, Rwanda</li>
              <li>📞 +250 788 123 456</li>
              <li>✉️ info@freshtalent.rw</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-white">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition">📘</a>
              <a href="#" className="hover:text-white transition">📸</a>
              <a href="#" className="hover:text-white transition">🐦</a>
            </div>
            <a href="https://wa.me/250788123456" className="mt-4 inline-block text-green-400 hover:text-green-300 transition">
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2026 Fresh Talent Store. All rights reserved. Kigali, Rwanda</p>
        </div>
      </div>
    </footer>
  );
}
