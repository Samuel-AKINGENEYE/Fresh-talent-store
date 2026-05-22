export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold">
            <span className="text-blue-600">Fresh Talent</span>
            <span className="text-orange-500"> Store</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hidden md:block text-gray-600 hover:text-blue-600">Sign In</button>
            <button className="rounded-full bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
              Cart (0)
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Tech. Fresh. For You.
          </h1>
          <p className="mb-8 text-xl text-blue-100 md:text-2xl">
            Premium electronics delivered fast in Kigali, Rwanda 🇷🇼
          </p>
          <button className="rounded-lg bg-orange-500 px-6 py-3 font-semibold hover:bg-orange-600 transition">
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {['📱 Smartphones', '💻 Laptops', '🎧 Audio', '🔌 Accessories', '⌚ Wearables', '🎮 Gaming', '📺 TV', '📷 Cameras'].map((cat) => (
            <div key={cat} className="rounded-lg border p-4 text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-3xl mb-2">{cat.split(' ')[0]}</div>
              <p className="text-sm font-medium">{cat.split(' ').slice(1).join(' ')}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold">Featured Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg bg-white p-4 shadow hover:shadow-lg transition">
                <div className="mb-4 aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">📷 Image</span>
                </div>
                <h3 className="font-semibold">Product {i}</h3>
                <p className="text-sm text-gray-500">Category</p>
                <p className="mt-2 text-lg font-bold text-blue-600">RWF 0</p>
                <button className="mt-3 w-full rounded-lg bg-orange-500 py-2 text-white hover:bg-orange-600 transition">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">⚡ Flash Sale</h2>
          <p className="mb-4">Up to 50% off on selected items</p>
          <div className="mb-4 flex justify-center space-x-4 text-2xl font-bold">
            <span>12h</span> <span>24m</span> <span>35s</span>
          </div>
          <button className="rounded-lg bg-white px-6 py-2 font-semibold text-orange-500 hover:bg-gray-100 transition">
            Shop Flash Deals
          </button>
        </div>
      </section>

      {/* Footer */}
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
    </main>
  );
}
