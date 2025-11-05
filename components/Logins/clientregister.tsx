import React, { useState } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig"; // Ensure Firebase is correctly configured
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const ClientRegistration: React.FC = () => {
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
      // Firebase Authentication: Create user (this will fail if email already exists)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
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
        email: formData.email,
        createdAt: new Date(),
      });

      setMessage("Registration successful! Please check your email and verify your account before logging in.");
      setFormData({ name: "", number: "", email: "", password: "" }); // Reset form
      setTimeout(() => router.push("/login"), 4000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-800 to-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-opacity-80 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Register as a Client
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}
          {message && (
            <p className="text-green-500 text-center font-medium">{message}</p>
          )}
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
              className="w-full mt-2 p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
              className="w-full mt-2 p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
              name="password"
              value={formData.password}
              onChange={handleInputChange}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientRegistration;
