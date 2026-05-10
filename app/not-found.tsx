import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="text-gold-500 text-sm uppercase tracking-[0.25em]">404</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-serif text-charcoal">Page Not Found</h1>
        <p className="mt-4 text-zinc-500">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 bg-charcoal text-white px-8 py-3 rounded-full hover:bg-zinc-800 transition-colors text-sm uppercase tracking-wider"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
