export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-cream" />
      <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-cream" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-surface p-0 shadow-card">
            <div className="aspect-square animate-pulse rounded-t-2xl bg-cream" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-cream" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-cream" />
              <div className="mt-2 h-5 w-24 animate-pulse rounded bg-cream" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
