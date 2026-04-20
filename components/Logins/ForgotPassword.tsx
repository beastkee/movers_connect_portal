import React, { useState } from "react";
import { useRouter } from "next/router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      
      setSuccessMessage(
        "Password reset link sent! Check your email for instructions."
      );
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      // Handle different error types
      if (err.code === "auth/user-not-found") {
        setError("No account with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many password reset requests. Try again later.");
      } else {
        setError(err.message || "Failed to send reset email. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] px-5 text-[#e8ecff]">
      <div className="w-full max-w-md rounded-2xl border border-[#7ba1ff]/30 bg-[#0f1834]/85 p-7 shadow-[0_20px_50px_rgba(3,7,20,0.55)] backdrop-blur-sm">
        <h1 className="mb-2 text-center text-3xl font-black">Reset Password</h1>
        <p className="mb-8 text-center text-[#b8c4ea]">
          Enter your email address and to get link to reset password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-[#ff8f9f]/45 bg-[#ff8f9f]/15 p-4 text-[#ffd4db]">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="rounded-lg border border-[#7de3ba]/45 bg-[#7de3ba]/12 p-4 text-[#d7ffef]">
              {successMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              className="mt-2 w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] p-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold rounded-lg transition ${
              loading
                ? "cursor-not-allowed bg-[#51608d] text-[#d5ddff]"
                : "bg-[#7ba1ff] text-[#08112b] hover:bg-[#9bb7ff]"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-[#9fb8ff] hover:text-[#c4d4ff] hover:underline"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
