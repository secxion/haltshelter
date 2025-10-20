export default function Dashboard(){
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard (Placeholder)</h1>
      <p className="text-gray-600 mb-4">Future area for managing stories, volunteers, donors, and analytics summaries.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {["Stories","Donors","Newsletter"].map(w => (
          <div key={w} className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-1">{w}</h3>
            <p className="text-sm text-gray-600">Management panel coming soon.</p>
          </div>
        ))}
      </div>
    </main>
  );
}
