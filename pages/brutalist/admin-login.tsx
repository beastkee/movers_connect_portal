import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const BrutalistAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const adminEmails = ["admin@admin.com", "admin@moversconnect.com", "beastkee@example.com"];
      if (!adminEmails.includes(email)) {
        setError("Admin emails only.");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      router.push("/brutalist/admin-dashboard");
    } catch (err: any) {
      setError(err?.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8db] text-black">
      <div className="mx-auto max-w-3xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#b8ff4a] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em]">Brutalist Auth / Admin</p>
          <h1 className="mt-1 text-4xl font-black uppercase">Admin Login</h1>
        </header>

        <main className="bg-white p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="border-4 border-black bg-[#ffd8ce] p-3 text-sm font-bold">{error}</p>}

            <div>
              <label className="text-xs font-black uppercase">Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
            </div>

            <div>
              <label className="text-xs font-black uppercase">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
            </div>

            <button disabled={loading} className="w-full border-4 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white hover:bg-white hover:text-black disabled:opacity-50">
              {loading ? "Checking..." : "Enter Admin Console"}
            </button>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#f8f5ec] p-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/brutalist/login" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">Back to User Login</Link>
            <Link href="/adminlogin" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">Open Classic Admin Login</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BrutalistAdminLogin;
