import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { brutal, BrutalistButton, BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

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
    <BrutalistShell eyebrow="Brutalist Auth / Admin" title="Admin Login" headerClassName="bg-[#b8ff4a]">

        <main className="bg-white p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className={brutal.alert}>{error}</p>}

            <div>
              <label className={brutal.label}>Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={brutal.input} />
            </div>

            <div>
              <label className={brutal.label}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={brutal.input} />
            </div>

            <BrutalistButton disabled={loading} full>
              {loading ? "Checking..." : "Enter Admin Console"}
            </BrutalistButton>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#f8f5ec] p-4">
          <div className="flex flex-wrap gap-2">
            <BrutalistLinkButton href="/brutalist/login">Back to User Login</BrutalistLinkButton>
            <BrutalistLinkButton href="/adminlogin">Open Classic Admin Login</BrutalistLinkButton>
          </div>
        </footer>
    </BrutalistShell>
  );
};

export default BrutalistAdminLogin;
