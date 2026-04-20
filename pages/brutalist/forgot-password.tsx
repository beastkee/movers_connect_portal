import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const BrutalistForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Reset link sent. Check your inbox.");
      setTimeout(() => router.push("/brutalist/login"), 2200);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ece6d8] text-black">
      <div className="mx-auto max-w-3xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#ffe55a] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em]">Brutalist Auth / Recovery</p>
          <h1 className="mt-1 text-4xl font-black uppercase">Reset Password</h1>
        </header>

        <main className="bg-white p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="border-4 border-black bg-[#ffd8cf] p-3 text-sm font-bold">{error}</p>}
            {success && <p className="border-4 border-black bg-[#dbf7d0] p-3 text-sm font-bold">{success}</p>}

            <div>
              <label className="text-xs font-black uppercase">Account Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold"
              />
            </div>

            <button disabled={loading} className="w-full border-4 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white hover:bg-white hover:text-black disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#f8f5ec] p-4">
          <Link href="/brutalist/login" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">
            Back to Login
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default BrutalistForgotPassword;
