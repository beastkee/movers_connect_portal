import Link from "next/link";
import { useRouter } from "next/router";

const BrutalistRoles = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#ece7d9] text-black">
      <div className="mx-auto max-w-5xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#b8ff4a] p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em]">Brutalist Auth / Roles</p>
          <h1 className="mt-2 text-4xl font-black uppercase">Pick Your Side</h1>
          <p className="mt-2 text-sm font-semibold">No rounded fluff. Choose a track and continue.</p>
        </header>

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
          <Link href="/brutalist/login" className="border-4 border-black bg-black px-3 py-2 text-xs font-black uppercase text-white hover:bg-white hover:text-black">
            Back to Login
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default BrutalistRoles;
