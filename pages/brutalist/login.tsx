import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

const BrutalistLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Verify your email first, then try again.");
        return;
      }

      const moversRef = collection(db, "users", user.uid, "movers");
      const clientsRef = collection(db, "users", user.uid, "clients");

      const [moverSnapshot, clientSnapshot] = await Promise.all([
        getDocs(moversRef),
        getDocs(clientsRef),
      ]);

      if (!moverSnapshot.empty) {
        router.push("/brutalist/mover-dashboard");
      } else if (!clientSnapshot.empty) {
        router.push("/brutalist/client-dashboard");
      } else {
        setError("No profile found for this account.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe9dc] text-black">
      <div className="mx-auto max-w-4xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#ff7a45] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em]">Brutalist Auth / Login</p>
          <h1 className="mt-1 text-4xl font-black uppercase">Enter Workspace</h1>
        </header>

        <main className="grid gap-0 md:grid-cols-2">
          <section className="border-b-4 border-r-0 border-black bg-white p-5 md:border-b-0 md:border-r-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <p className="border-4 border-black bg-[#ffd8d1] p-3 text-sm font-bold">{error}</p>}

              <div>
                <label htmlFor="email" className="text-xs font-black uppercase">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full border-4 border-black bg-[#fffdf7] px-3 py-3 text-sm font-semibold outline-none focus:bg-[#fff6c8]"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-black uppercase">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full border-4 border-black bg-[#fffdf7] px-3 py-3 text-sm font-semibold outline-none focus:bg-[#fff6c8]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full border-4 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white hover:bg-white hover:text-black disabled:opacity-50"
              >
                {loading ? "Checking..." : "Log In"}
              </button>
            </form>
          </section>

          <aside className="bg-[#f8f5eb] p-5">
            <p className="text-xs font-black uppercase tracking-wide">Preview Links</p>
            <div className="mt-3 space-y-2">
              <Link href="/brutalist/forgot-password" className="block border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
                Forgot Password
              </Link>
              <Link href="/brutalist/roles" className="block border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
                Create Account
              </Link>
              <Link href="/brutalist/admin-login" className="block border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
                Admin Login
              </Link>
              <Link href="/brutalist" className="block border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
                Back to Preview Hub
              </Link>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default BrutalistLogin;
