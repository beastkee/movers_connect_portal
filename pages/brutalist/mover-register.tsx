import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import { brutal, BrutalistButton, BrutalistLinkButton, BrutalistShell } from "@/components/brutalist/ui";

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
    <BrutalistShell eyebrow="Brutalist Auth / Mover Register" title="Mover Sign Up" headerClassName="bg-[#ff6d3d]">

        <main className="bg-white p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className={brutal.alert}>{error}</p>}
            {success && <p className={brutal.success}>{success}</p>}

            <div>
              <label className={brutal.label}>Company Name</label>
              <input name="companyName" value={form.companyName} onChange={onChange} required className={brutal.input} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={brutal.label}>Service Area</label>
                <input name="serviceArea" value={form.serviceArea} onChange={onChange} required className={brutal.input} />
              </div>
              <div>
                <label className={brutal.label}>Contact Number</label>
                <input name="contactNumber" value={form.contactNumber} onChange={onChange} required className={brutal.input} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={brutal.label}>Email</label>
                <input name="email" type="email" value={form.email} onChange={onChange} required className={brutal.input} />
              </div>
              <div>
                <label className={brutal.label}>Password</label>
                <input name="password" type="password" value={form.password} onChange={onChange} required className={brutal.input} />
              </div>
            </div>

            <BrutalistButton disabled={loading} full>
              {loading ? "Creating..." : "Create Mover Account"}
            </BrutalistButton>
          </form>
        </main>

        <footer className="border-t-4 border-black bg-[#faf7ef] p-4">
          <div className="flex flex-wrap gap-2">
            <BrutalistLinkButton href="/brutalist/login">Back to Login</BrutalistLinkButton>
            <BrutalistLinkButton href="/brutalist/roles">Change Role</BrutalistLinkButton>
          </div>
        </footer>
    </BrutalistShell>
  );
};

export default BrutalistMoverRegister;
