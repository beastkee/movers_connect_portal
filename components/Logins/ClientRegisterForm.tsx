import React, { useState } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig"; // Ensure Firebase is correctly configured
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth";

const ClientRegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();

      // Avoid email-already-in-use throw by checking first.
      const existingMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      if (existingMethods.length > 0) {
        setError("This email is already registered. Please log in or reset your password.");
        return;
      }

      // Firebase Authentication: Create user (this will fail if email already exists)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        formData.password
      );
      const user = userCredential.user;

      // Check if this user is already registered as a mover
      const moverDoc = await getDoc(doc(db, "users", user.uid, "movers", user.uid));
      if (moverDoc.exists()) {
        // User is already a mover, delete the auth account and show error
        await user.delete();
        setError("This account is already registered as a Mover. Each user can only have one role. Please login as a mover or use a different email.");
        setLoading(false);
        return;
      }

      // Send email verification
      await sendEmailVerification(user);

      // Firebase Firestore: Store user data under the 'clients' subcollection of the 'users' collection
      await setDoc(doc(db, "users", user.uid, "clients", user.uid), {
        name: formData.name,
        number: formData.number,
        email: normalizedEmail,
        createdAt: new Date(),
      });

      setMessage("Registration successful! Please check your email and verify your account before logging in.");
      setFormData({ name: "", number: "", email: "", password: "" }); // Reset form
      setTimeout(() => router.push("/login"), 4000);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in or reset your password.");
      } else {
        setError(err?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] px-5 text-[#e8ecff]">
      <div className="w-full max-w-md rounded-2xl border border-[#7ba1ff]/30 bg-[#0f1834]/85 p-7 shadow-[0_20px_50px_rgba(3,7,20,0.55)] backdrop-blur-sm">
        <h1 className="mb-6 text-center text-3xl font-black">
          Register as a Client
        </h1>
        <form
          onSubmit={(e) => {
            handleSubmit(e).catch((err) => {
              console.error("Unhandled client registration error:", err);
              setError("Registration failed. Please try again.");
              setLoading(false);
            });
          }}
          className="space-y-6"
        >
          {error && <p className="rounded-lg border border-[#ff8f9f]/45 bg-[#ff8f9f]/15 p-3 text-center text-sm font-medium text-[#ffd4db]">{error}</p>}
          {message && <p className="rounded-lg border border-[#7de3ba]/45 bg-[#7de3ba]/12 p-3 text-center text-sm font-medium text-[#d7ffef]">{message}</p>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-2 w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] p-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium">
              Phone Number
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              required
              className="mt-2 w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] p-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-2 w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] p-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-2 w-full rounded-lg border border-[#7ba1ff]/40 bg-[#132148] p-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientRegisterForm;
