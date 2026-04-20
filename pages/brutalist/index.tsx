import { BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

const BrutalistPreviewIndex = () => {
  return (
    <BrutalistShell
      headerClassName="bg-[repeating-linear-gradient(90deg,#ffe600_0_14px,#000_14px_18px,#00d2ff_18px_32px,#000_32px_36px,#ff2fb3_36px_50px,#000_50px_54px)] p-6"
      eyebrow="Preview Branch"
      title="Movers Connect Brutalist Preview"
    >
      <div className="relative overflow-hidden border-b-4 border-black bg-[#fff8e6] p-6">
        <div className="pointer-events-none absolute -right-8 -top-6 z-0 h-20 w-44 rotate-12 border-4 border-black bg-[#00d2ff]" />
        <div className="pointer-events-none absolute -left-6 bottom-2 z-0 h-12 w-36 -rotate-6 border-4 border-black bg-[#ff2fb3]" />
        <p className="relative z-10 max-w-4xl text-sm font-black uppercase tracking-wide">
          Parallel experiment route set. This space is intentionally noisy, uneven, and human-cut.
          We are not polishing edges here, we are printing attitude.
        </p>
      </div>

      <main className="relative grid gap-4 p-4 md:grid-cols-12 md:p-6">
        <article className="border-4 border-black bg-white p-5 shadow-[8px_8px_0_#000] md:col-span-5 md:rotate-[-1deg]">
          <h2 className="text-2xl font-black uppercase">Client / Finder Desk</h2>
          <p className="mt-2 text-sm font-semibold">Scan verified movers through a loud, high-speed catalog view.</p>
          <BrutalistLinkButton href="/brutalist/client-dashboard" className="mt-5 text-sm">
            Open Client Preview
          </BrutalistLinkButton>
        </article>

        <article className="border-4 border-black bg-[#fff3be] p-5 shadow-[8px_8px_0_#000] md:col-span-4 md:mt-8 md:rotate-[1.1deg]">
          <h2 className="text-2xl font-black uppercase">Mover / Ops Floor</h2>
          <p className="mt-2 text-sm font-semibold">Track assignments and status on a board built like a control wall.</p>
          <BrutalistLinkButton href="/brutalist/mover-dashboard" className="mt-5 text-sm" tone="accent">
            Open Mover Preview
          </BrutalistLinkButton>
        </article>

        <article className="border-4 border-black bg-[#dbf8ff] p-5 shadow-[8px_8px_0_#000] md:col-span-3 md:mt-2 md:rotate-[-0.8deg]">
          <h2 className="text-2xl font-black uppercase">Admin / Gate</h2>
          <p className="mt-2 text-sm font-semibold">Moderate verification with dense command cues and no softness.</p>
          <BrutalistLinkButton href="/brutalist/admin-dashboard" className="mt-5 text-sm">
            Open Admin Preview
          </BrutalistLinkButton>
        </article>

        <section className="border-4 border-black bg-[#fffdf5] p-5 shadow-[8px_8px_0_#000] md:col-span-12 md:-mt-1 md:rotate-[0.5deg]">
          <h2 className="text-2xl font-black uppercase">Auth Flow Preview</h2>
          <p className="mt-2 text-sm font-semibold">Parallel auth journey rendered as a print-collage command strip.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <BrutalistLinkButton href="/brutalist/login">Login</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/roles">Roles</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/client-register">Client Register</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/mover-register">Mover Register</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/forgot-password">Forgot Password</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/admin-login">Admin Login</BrutalistLinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-black bg-white p-4 text-xs font-bold uppercase tracking-wide">
        Existing production routes remain untouched.
      </footer>
    </BrutalistShell>
  );
};

export default BrutalistPreviewIndex;
