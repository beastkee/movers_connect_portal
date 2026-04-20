import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { isAdminEmail } from "@/firebase/adminConfig";

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Admins can use this same login and are routed directly.
      if (isAdminEmail(user.email)) {
        router.push("/admin-dashboard");
        return;
      }

      if (!user.emailVerified) {
        setError("Please verify your email before logging in. Check your inbox for a verification link.");
        setLoading(false);
        return;
      }

      // Determine role from authenticated UID paths for stable lookups.
      const moversRef = collection(db, "users", user.uid, "movers");
      const clientsRef = collection(db, "users", user.uid, "clients");

      const [moverSnapshot, clientSnapshot] = await Promise.all([
        getDocs(moversRef),
        getDocs(clientsRef),
      ]);

      if (!moverSnapshot.empty) {
        router.push("/mover-dashboard");
      } else if (!clientSnapshot.empty) {
        router.push("/client-dashboard");
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
    <div className="relative min-h-screen overflow-hidden bg-[#f5f0e5] text-[#1e1c19]">
      <div className="pointer-events-none absolute left-2 top-8 h-44 w-44 rounded-full bg-[#ff7a59]/20 blur-2xl" />
      <div className="pointer-events-none absolute right-4 top-6 h-40 w-40 rounded-full bg-[#53d8ff]/20 blur-2xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-8">
        <section className="w-full rounded-[1.5rem] border-2 border-[#1e1c19] bg-[#fff7ea] p-6 shadow-[6px_6px_0_#1e1c19] md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7f2a18]">Movers Connect</p>
          <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">Welcome Back</h1>
          <p className="mt-3 max-w-md text-sm text-[#4a4036]">
            Your next move starts here. Log in to manage bookings, quotes, and client communication.
          </p>

          <div className="mt-4 rounded-xl border border-[#1e1c19]/25 bg-white/70 px-4 py-2.5">
            <p className="text-sm font-semibold text-[#3b332b]">Quick summary</p>
            <p className="mt-1 text-sm text-[#5c5247]">Book movers, compare quotes, and message in one place.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4.5">
            {error && <p className="rounded-xl border-2 border-[#7f2a18] bg-[#ffe1da] px-4 py-3 text-sm font-semibold text-[#7f2a18]">{error}</p>}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.16em] text-[#4a4036]">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border-2 border-[#1e1c19] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#53d8ff] focus:ring-2 focus:ring-[#53d8ff]/40"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.16em] text-[#4a4036]">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border-2 border-[#1e1c19] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#53d8ff] focus:ring-2 focus:ring-[#53d8ff]/40"
              />
            </div>

            <button
              type="submit"
              className={`w-full rounded-xl border-2 border-[#1e1c19] py-3 text-base font-black uppercase tracking-[0.08em] transition ${
                loading
                  ? "cursor-not-allowed bg-[#d4cec4] text-[#6f665c]"
                  : "bg-[#1e1c19] text-white hover:bg-[#53d8ff] hover:text-[#1e1c19]"
              }`}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm font-semibold text-[#235a6c] underline decoration-2 underline-offset-2 hover:text-[#0d3f4d]">
                Forgot Password?
              </Link>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[#4a4036]">
            Don&apos;t have an account?{" "}
            <Link href="/roles" className="font-bold text-[#7f2a18] underline decoration-2 underline-offset-2 hover:text-[#4f170d]">
              Sign up
            </Link>
          </p>

          <div className="mt-4 overflow-hidden rounded-lg border border-[#1e1c19]/20 bg-white/60 px-3 py-2">
            <p className="login-ticker whitespace-nowrap text-xs font-semibold tracking-wide text-[#4a4036]">
              Live updates: Admin access now works through this same login form • Booking status and quote updates are real-time • Chat stays synced with movers
            </p>
          </div>
        </section>
      </div>

      <style jsx>{`
        .login-ticker {
          display: inline-block;
          padding-left: 100%;
          animation: loginTicker 16s linear infinite;
        }

        @keyframes loginTicker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-ticker {
            animation: none;
            padding-left: 0;
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
