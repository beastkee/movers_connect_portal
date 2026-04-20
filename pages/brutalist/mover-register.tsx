import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

type MoverForm = {
  companyName: string;
  serviceArea: string;
  contactNumber: string;
  email: string;
  password: string;
};

const BrutalistMoverRegister = () => {
  const [form, setForm] = useState<MoverForm>({
    companyName: "",
    serviceArea: "",
    contactNumber: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      if (methods.length > 0) {
        setError("Email already exists. Login or reset password.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, form.password);
      const user = userCredential.user;

      const clientDoc = await getDoc(doc(db, "users", user.uid, "clients", user.uid));
      if (clientDoc.exists()) {
        await user.delete();
        setError("This account already exists as client role.");
        return;
      }

      await setDoc(doc(db, "users", user.uid, "movers", user.uid), {
        companyName: form.companyName,
        serviceArea: form.serviceArea,
        contactNumber: form.contactNumber,
        email: normalizedEmail,
        credentials: [],
        status: "available",
        verificationStatus: "pending",
        createdAt: new Date(),
      });

      sendEmailVerification(user).catch(() => null);

      setSuccess("Mover account created. Await admin verification for quote access.");
      setForm({ companyName: "", serviceArea: "", contactNumber: "", email: "", password: "" });
      setTimeout(() => router.push("/brutalist/login"), 2500);
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ede8dc] text-black">
      <div className="mx-auto max-w-4xl border-x-4 border-black">
        <header className="border-b-4 border-black bg-[#ff6d3d] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em]">Brutalist Auth / Mover Register</p>
          <h1 className="mt-1 text-4xl font-black uppercase">Mover Sign Up</h1>
        </header>

        <main className="bg-white p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="border-4 border-black bg-[#ffd6cf] p-3 text-sm font-bold">{error}</p>}
            {success && <p className="border-4 border-black bg-[#dbf9d1] p-3 text-sm font-bold">{success}</p>}

            <div>
              <label className="text-xs font-black uppercase">Company Name</label>
              <input name="companyName" value={form.companyName} onChange={onChange} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase">Service Area</label>
                <input name="serviceArea" value={form.serviceArea} onChange={onChange} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
              </div>
              <div>
                <label className="text-xs font-black uppercase">Contact Number</label>
                <input name="contactNumber" value={form.contactNumber} onChange={onChange} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase">Email</label>
                <input name="email" type="email" value={form.email} onChange={onChange} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
              </div>
              <div>
                <label className="text-xs font-black uppercase">Password</label>
                <input name="password" type="password" value={form.password} onChange={onChange} required className="mt-1 w-full border-4 border-black px-3 py-3 text-sm font-semibold" />
              </div>
            </div>

            <button disabled={loading} className="w-full border-4 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white hover:bg-white hover:text-black disabled:opacity-50">
              {loading ? "Creating..." : "Create Mover Account"}
            </button>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#faf7ef] p-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/brutalist/login" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">Back to Login</Link>
            <Link href="/brutalist/roles" className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-black hover:text-white">Change Role</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BrutalistMoverRegister;
