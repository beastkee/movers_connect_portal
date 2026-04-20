import { useRouter } from "next/router";

const RolesPage = () => {
  const router = useRouter();

  const handleRoleSelection = (role: "client" | "mover") => {
    if (role === "client") {
      router.push("/client-register");
    } else if (role === "mover") {
      router.push("/mover-register");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] px-5 text-[#e8ecff]">
      <div className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-[#7ba1ff]/18 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-6 h-64 w-64 rounded-full bg-[#ff8f9f]/15 blur-3xl" />

      <div className="w-full max-w-2xl rounded-3xl border border-[#7ba1ff]/30 bg-[#0f1834]/85 p-8 text-center shadow-[0_20px_50px_rgba(3,7,20,0.55)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9fb8ff]">Welcome</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Choose Your Role</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-[#b8c4ea]">
          Are you joining as a <strong>Client</strong> or a <strong>Mover</strong>? Select your role to continue.
        </p>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-center">
        <button
          onClick={() => handleRoleSelection("client")}
          className="flex items-center justify-center gap-3 rounded-xl border border-[#7ba1ff]/45 bg-[#132148] px-8 py-4 text-lg font-semibold text-[#d7e0ff] transition hover:bg-[#7ba1ff] hover:text-[#08112b]"
        >
          <span className="text-2xl">🧑‍💼</span>
          <span>Register as Client</span>
        </button>
        <button
          onClick={() => handleRoleSelection("mover")}
          className="flex items-center justify-center gap-3 rounded-xl border border-[#7ba1ff]/45 bg-[#132148] px-8 py-4 text-lg font-semibold text-[#d7e0ff] transition hover:bg-[#7ba1ff] hover:text-[#08112b]"
        >
          <span className="text-2xl">📦</span>
          <span>Register as Mover</span>
        </button>
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
