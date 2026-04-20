import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";

const BrutalistClientRegister = () => {
  const [formData, setFormData] = useState({ name: "", number: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      if (methods.length > 0) {
        setError("Email already used. Login or reset password.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, formData.password);
      const user = userCredential.user;

      const moverDoc = await getDoc(doc(db, "users", user.uid, "movers", user.uid));
      if (moverDoc.exists()) {
        await user.delete();
        setError("This account already exists as mover role.");
        return;
      }

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid, "clients", user.uid), {
        name: formData.name,
        number: formData.number,
        email: normalizedEmail,
        createdAt: new Date(),
      });

      setSuccess("Client account created. Verify email, then login.");
      setFormData({ name: "", number: "", email: "", password: "" });
      setTimeout(() => router.push("/brutalist/login"), 2500);
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efe8da] text-black">
      <div className="mx-auto max-w-4xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#ffe55a] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em]">Brutalist Auth / Client Register</p>
          <h1 className="mt-1 text-4xl font-black uppercase">Client Sign Up</h1>
        </header>

        <main className="bg-white p-5">
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="border-4 border-black bg-[#ffd7cf] p-3 text-sm font-bold">{error}</p>}
            {success && <p className="border-4 border-black bg-[#dff9d2] p-3 text-sm font-bold">{success}</p>}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase">Full Name</label>
                <input name="name" value={formData.name} onChange={updateField} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
              </div>
              <div>
                <label className="text-xs font-black uppercase">Phone</label>
                <input name="number" value={formData.number} onChange={updateField} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase">Email</label>
              <input name="email" type="email" value={formData.email} onChange={updateField} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
            </div>

            <div>
              <label className="text-xs font-black uppercase">Password</label>
              <input name="password" type="password" value={formData.password} onChange={updateField} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
            </div>

            <button disabled={loading} className="w-full border-4 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white hover:bg-white hover:text-black disabled:opacity-50">
              {loading ? "Creating..." : "Create Client Account"}
            </button>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#f9f6ee] p-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/brutalist/login" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">Back to Login</Link>
            <Link href="/brutalist/roles" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">Change Role</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BrutalistClientRegister;
