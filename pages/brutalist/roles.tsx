import { useRouter } from "next/router";
import { BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

const BrutalistRoles = () => {
  const router = useRouter();

  return (
    <BrutalistShell
      headerClassName="bg-[#b8ff4a] p-6"
      eyebrow="Brutalist Auth / Roles"
      title="Pick Your Side"
    >
        <div className="px-6 pb-4">
          <p className="mt-2 text-sm font-semibold">No rounded fluff. Choose a track and continue.</p>
        </div>

        <main className="grid gap-0 md:grid-cols-2">
          <button
            onClick={() => router.push("/brutalist/client-register")}
            className="border-b-4 border-r-0 border-black bg-white p-8 text-left hover:bg-black hover:text-white md:border-b-0 md:border-r-4"
          >
            <p className="text-xs font-black uppercase tracking-wide">Path 01</p>
            <h2 className="mt-2 text-3xl font-black uppercase">Client</h2>
            <p className="mt-3 text-sm font-semibold">Find movers, request quotes, track jobs.</p>
          </button>

          <button
            onClick={() => router.push("/brutalist/mover-register")}
            className="bg-[#fff4d0] p-8 text-left hover:bg-black hover:text-white"
          >
            <p className="text-xs font-black uppercase tracking-wide">Path 02</p>
            <h2 className="mt-2 text-3xl font-black uppercase">Mover</h2>
            <p className="mt-3 text-sm font-semibold">Register company profile, get vetted, receive work.</p>
          </button>
        </main>

        <footer className="border-t-4 border-black bg-white p-4">
          <BrutalistLinkButton href="/brutalist/login" tone="dark">
            Back to Login
          </BrutalistLinkButton>
        </footer>
    </BrutalistShell>
  );
};

export default BrutalistRoles;
