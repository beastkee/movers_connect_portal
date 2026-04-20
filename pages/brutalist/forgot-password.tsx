import { useState } from "react";
import { useRouter } from "next/router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { brutal, BrutalistButton, BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

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
    <BrutalistShell
      eyebrow="Brutalist Auth / Recovery"
      title="Reset Password"
      headerClassName="bg-[repeating-linear-gradient(135deg,#ffe600_0_16px,#000_16px_20px,#ff2fb3_20px_36px,#000_36px_40px,#00d2ff_40px_56px,#000_56px_60px)]"
    >

        <main className="bg-white p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className={brutal.alert}>{error}</p>}
            {success && <p className={brutal.success}>{success}</p>}

            <div>
              <label className={brutal.label}>Account Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={brutal.input}
              />
            </div>

            <BrutalistButton disabled={loading} full>
              {loading ? "Sending..." : "Send Reset Link"}
            </BrutalistButton>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#f8f5ec] p-4">
          <BrutalistLinkButton href="/brutalist/login">
            Back to Login
          </BrutalistLinkButton>
        </footer>
    </BrutalistShell>
  );
};

export default BrutalistForgotPassword;
