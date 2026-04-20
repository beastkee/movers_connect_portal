import Link from "next/link";

const BrutalistPreviewIndex = () => {
  return (
    <div className="min-h-screen bg-[#f3f1e8] text-black">
      <div className="mx-auto max-w-6xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#ffd447] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">Preview Branch</p>
          <h1 className="mt-2 text-4xl font-black uppercase leading-tight">
            Movers Connect Brutalist Preview
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-medium">
            Parallel experiment route set. Hard borders, direct hierarchy, low ornament, and
            intentional constraints to feel human-built under realistic solo-dev time pressure.
          </p>
        </header>

        <main className="grid gap-0 md:grid-cols-3">
          <article className="border-b-4 border-r-0 border-black p-6 md:border-b-0 md:border-r-4">
            <h2 className="text-2xl font-black uppercase">Client</h2>
            <p className="mt-2 text-sm">
              Search approved movers fast with high-contrast scanning and hard-edge visual rhythm.
            </p>
            <Link
              href="/brutalist/client-dashboard"
              className="mt-6 inline-block border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase hover:bg-black hover:text-white"
            >
              Open Client Preview
            </Link>
          </article>

          <article className="border-b-4 border-r-0 border-black p-6 md:border-b-0 md:border-r-4">
            <h2 className="text-2xl font-black uppercase">Mover</h2>
            <p className="mt-2 text-sm">
              See assignment board and operational stats in a command-style, type-led layout.
            </p>
            <Link
              href="/brutalist/mover-dashboard"
              className="mt-6 inline-block border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase hover:bg-black hover:text-white"
            >
              Open Mover Preview
            </Link>
          </article>

          <article className="p-6">
            <h2 className="text-2xl font-black uppercase">Admin</h2>
            <p className="mt-2 text-sm">
              Moderate verification queues with a compact, newspaper-like command center.
            </p>
            <Link
              href="/brutalist/admin-dashboard"
              className="mt-6 inline-block border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase hover:bg-black hover:text-white"
            >
              Open Admin Preview
            </Link>
          </article>
        </main>

        <footer className="border-t-4 border-black bg-white p-4 text-xs font-bold uppercase tracking-wide">
          Existing production routes remain untouched.
        </footer>
      </div>
    </div>
  );
};

export default BrutalistPreviewIndex;
