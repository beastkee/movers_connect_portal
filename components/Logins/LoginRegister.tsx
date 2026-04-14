import React, { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig"; // Import your Firebase auth instance
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Import your Firestore db instance

const LoginPage = () => {
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
      // Sign in the user using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Require email verification
      if (!user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox for a verification link.");
        setLoading(false);
        return;
      }

      // Determine role by checking docs under the authenticated UID path.
      // This is resilient to email casing/format differences and password resets.
      const moversRef = collection(db, "users", user.uid, "movers");
      const clientsRef = collection(db, "users", user.uid, "clients");

      const [moverSnapshot, clientSnapshot] = await Promise.all([
        getDocs(moversRef),
        getDocs(clientsRef),
      ]);

      if (!moverSnapshot.empty) {
        // User found in the 'movers' subcollection
        router.push("/mover"); // Redirect to mover dashboard
      } else if (!clientSnapshot.empty) {
        // User found in the 'clients' subcollection
        router.push("/dashboardclient"); // Redirect to client dashboard
      } else {
        setError("User profile not found. Please contact support.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-800 to-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-opacity-80 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-center mb-6">Welcome Back</h1>
        <p className="text-gray-400 text-center mb-8">
          Log in to your account to access your dashboard.
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-2 p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
            {loading ? "Logging in..." : "Log In"}
          </button>
          
          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm text-purple-400 hover:underline hover:text-purple-300"
            >
              Forgot Password?
            </a>
          </div>
        </form>
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}
          <a
            href="/roles"
            className="text-purple-400 hover:underline hover:text-purple-300"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
