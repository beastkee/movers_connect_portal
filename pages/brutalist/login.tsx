import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { brutal, BrutalistButton, BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

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
    <BrutalistShell eyebrow="Brutalist Auth / Login" title="Enter Workspace" headerClassName="bg-[#ff7a45]">
      <main className="grid gap-0 md:grid-cols-2">
        <section className="border-b-4 border-r-0 border-black bg-white p-5 md:border-b-0 md:border-r-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className={brutal.alert}>{error}</p>}

            <div>
              <label htmlFor="email" className={brutal.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={brutal.input}
              />
            </div>

            <div>
              <label htmlFor="password" className={brutal.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={brutal.input}
              />
            </div>

            <BrutalistButton type="submit" disabled={loading} full>
              {loading ? "Checking..." : "Log In"}
            </BrutalistButton>
          </form>
        </section>

        <aside className="bg-[#f8f5eb] p-5">
          <p className="text-xs font-black uppercase tracking-wide">Preview Links</p>
          <div className="mt-3 space-y-2">
            <BrutalistLinkButton href="/brutalist/forgot-password" className="block">
              Forgot Password
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/roles" className="block">
              Create Account
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/admin-login" className="block">
              Admin Login
            </BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist" className="block">
              Back to Preview Hub
            </BrutalistLinkButton>
          </div>
        </aside>
      </main>
    </BrutalistShell>
  );
};

export default BrutalistLogin;
