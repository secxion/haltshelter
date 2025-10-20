export default function Merch(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Merch</h1>
      <p className="text-gray-600 mb-4">Mission-driven designs launching soon via Printful / Bonfire. All proceeds fund rescue operations.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {[1,2,3].map(i => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-xs">Mockup</div>
            <h3 className="font-semibold">Design Concept {i}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}
