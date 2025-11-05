import React, { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const AdminLoginPage = () => {
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
      // Check if it's an admin email
      const adminEmails = ["admin@admin.com", "admin@moversconnect.com", "beastkee@example.com"];
      
      if (!adminEmails.includes(email)) {
        setError("This login is for administrators only. Please use the regular login page.");
        setLoading(false);
        return;
      }

      // Sign in the admin
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-opacity-80 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-center mb-6">Admin Login</h1>
        <p className="text-gray-400 text-center mb-8">
          Administrator access only
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Back to regular login
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
