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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-800 to-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-opacity-80 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-center mb-2">Reset Password</h1>
        <p className="text-gray-400 text-center mb-8">
          Enter your email address and to get link to reset password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500 bg-opacity-20 rounded-lg border border-red-500 text-red-200">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="p-4 bg-green-500 bg-opacity-20 rounded-lg border border-green-500 text-green-200">
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
              className="w-full mt-2 p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold rounded-lg transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-purple-400 hover:underline hover:text-purple-300"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
