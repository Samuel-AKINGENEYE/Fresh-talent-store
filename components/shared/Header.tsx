'use client';

export function Header() {
  return (
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
  );
}
