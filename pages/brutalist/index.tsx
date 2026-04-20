import { BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

const BrutalistPreviewIndex = () => {
  return (
    <BrutalistShell
      headerClassName="bg-[#ffd447] p-6"
      eyebrow="Preview Branch"
      title="Movers Connect Brutalist Preview"
    >
      <div className="px-6 pb-6">
        <p className="mt-3 max-w-3xl text-sm font-medium">
            Parallel experiment route set. Hard borders, direct hierarchy, low ornament, and
            intentional constraints to feel human-built under realistic solo-dev time pressure.
        </p>
      </div>

        <main className="grid gap-0 md:grid-cols-3">
          <article className="border-b-4 border-r-0 border-black p-6 md:border-b-0 md:border-r-4">
            <h2 className="text-2xl font-black uppercase">Client</h2>
            <p className="mt-2 text-sm">
              Search approved movers fast with high-contrast scanning and hard-edge visual rhythm.
            </p>
            <BrutalistLinkButton href="/brutalist/client-dashboard" className="mt-6 text-sm">
              Open Client Preview
            </BrutalistLinkButton>
          </article>

          <article className="border-b-4 border-r-0 border-black p-6 md:border-b-0 md:border-r-4">
            <h2 className="text-2xl font-black uppercase">Mover</h2>
            <p className="mt-2 text-sm">
              See assignment board and operational stats in a command-style, type-led layout.
            </p>
            <BrutalistLinkButton href="/brutalist/mover-dashboard" className="mt-6 text-sm">
              Open Mover Preview
            </BrutalistLinkButton>
          </article>

          <article className="p-6">
            <h2 className="text-2xl font-black uppercase">Admin</h2>
            <p className="mt-2 text-sm">
              Moderate verification queues with a compact, newspaper-like command center.
            </p>
            <BrutalistLinkButton href="/brutalist/admin-dashboard" className="mt-6 text-sm">
              Open Admin Preview
            </BrutalistLinkButton>
          </article>
        </main>

        <section className="border-t-4 border-black bg-[#fffdf5] p-6">
          <h2 className="text-2xl font-black uppercase">Auth Flow Preview</h2>
          <p className="mt-2 text-sm font-medium">
            Full parallel auth journey with brutalist styling and working logic.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <BrutalistLinkButton href="/brutalist/login">
              Login
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/roles">
              Roles
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/client-register">
              Client Register
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/mover-register">
              Mover Register
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/forgot-password">
              Forgot Password
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/admin-login">
              Admin Login
            </BrutalistLinkButton>
          </div>
        </section>

        <footer className="border-t-4 border-black bg-white p-4 text-xs font-bold uppercase tracking-wide">
          Existing production routes remain untouched.
        </footer>
    </BrutalistShell>
  );
};

export default BrutalistPreviewIndex;
