import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
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

      <Footer />
    </main>
  );
}
