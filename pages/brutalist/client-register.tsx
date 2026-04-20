import { useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { brutal, BrutalistButton, BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

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
    <BrutalistShell
      eyebrow="Brutalist Auth / Client Register"
      title="Client Sign Up"
      headerClassName="bg-[repeating-linear-gradient(135deg,#ff2fb3_0_16px,#000_16px_20px,#00d2ff_20px_36px,#000_36px_40px,#ffe600_40px_56px,#000_56px_60px)]"
    >

        <main className="bg-white p-5">
          <form onSubmit={submit} className="space-y-4">
            {error && <p className={brutal.alert}>{error}</p>}
            {success && <p className={brutal.success}>{success}</p>}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={brutal.label}>Full Name</label>
                <input name="name" value={formData.name} onChange={updateField} required className={brutal.input} />
              </div>
              <div>
                <label className={brutal.label}>Phone</label>
                <input name="number" value={formData.number} onChange={updateField} required className={brutal.input} />
              </div>
            </div>

            <div>
              <label className={brutal.label}>Email</label>
              <input name="email" type="email" value={formData.email} onChange={updateField} required className={brutal.input} />
            </div>

            <div>
              <label className={brutal.label}>Password</label>
              <input name="password" type="password" value={formData.password} onChange={updateField} required className={brutal.input} />
            </div>

            <BrutalistButton disabled={loading} full>
              {loading ? "Creating..." : "Create Client Account"}
            </BrutalistButton>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#f9f6ee] p-4">
          <div className="flex flex-wrap gap-2">
            <BrutalistLinkButton href="/brutalist/login">Back to Login</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/roles">Change Role</BrutalistLinkButton>
          </div>
        </footer>
    </BrutalistShell>
  );
};

export default BrutalistClientRegister;
