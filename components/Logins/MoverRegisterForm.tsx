import React, { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { db, auth } from "@/firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";

type FormData = {
  companyName: string;
  serviceArea: string;
  contactNumber: string;
  email: string;
  password: string;
};


const MoverRegisterForm: React.FC = () => {
  const { register, handleSubmit, reset, formState } = useForm<FormData>();
  const { errors, isSubmitting } = formState;
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [credentialFiles, setCredentialFiles] = useState<FileList | null>(null);
  const [uploadingCreds, setUploadingCreds] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<string>("");
  const router = useRouter();

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const onSubmit = async (data: FormData) => {
    setUploadingCreds(true);
    setError(null);
    setSuccess(false);
    try {
      const normalizedEmail = data.email.trim().toLowerCase();

      // Avoid throwing email-already-in-use by checking first.
      const existingMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      if (existingMethods.length > 0) {
        setError("This email is already registered. Please log in or reset your password.");
        setRegistrationStep("");
        return;
      }

      // Create the user in Firebase Authentication (this will fail if email already exists)
      setRegistrationStep("Creating account...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        data.password
      );
      const user = userCredential.user;

      // Check if this user is already registered as a client
      const clientDoc = await getDoc(doc(db, "users", user.uid, "clients", user.uid));
      if (clientDoc.exists()) {
        // User is already a client, delete the auth account and show error
        await user.delete();
        setError("This account is already registered as a Client. Each user can only have one role. Please login as a client or use a different email.");
        setUploadingCreds(false);
        setRegistrationStep("");
        return;
      }

      // Save the user's basic details in Firestore immediately
      setRegistrationStep("Setting up profile...");
      const userRef = doc(db, "users", user.uid, "movers", user.uid);
      await setDoc(userRef, {
        companyName: data.companyName,
        serviceArea: data.serviceArea,
        contactNumber: data.contactNumber,
        email: normalizedEmail,
        credentials: [],
        status: "available",
        verificationStatus: "pending",
        createdAt: new Date(),
      });

      // Upload credentials in the background (non-blocking)
      if (credentialFiles && credentialFiles.length > 0) {
        setRegistrationStep(`Uploading ${credentialFiles.length} credential file(s)...`);
        const storage = getStorage();
        
        // Start uploads but don't wait for them
        Promise.all(
          Array.from(credentialFiles).map(async (file) => {
            const storageRef = ref(storage, `movers/${user.uid}/credentials/${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        ).then(async (credentialUrls) => {
          // Update credentials after upload completes
          await setDoc(userRef, { credentials: credentialUrls }, { merge: true });
        }).catch((err) => {
          console.error("Error uploading credentials:", err);
        });
      }

      // Send email verification (non-blocking)
      sendEmailVerification(user).catch((err: any) => {
        console.error("Error sending verification email:", err);
      });

      setSuccess(true);
      reset();
      setCredentialFiles(null);

      // Inform user about the verification process
      setError("Registration successful! You can now login. Your credentials will be verified by an admin before you can receive bookings.");
      // Redirect after a delay
      setTimeout(() => router.push("/login"), 4000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err?.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in or use a different email address.");
      } else {
        setError(err?.message || "Registration failed. Please try again.");
      }
      setRegistrationStep("");
    } finally {
      setUploadingCreds(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1024] via-[#111b3d] to-[#090f20] px-5">
      <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-[#7ba1ff]/30 bg-[#0f1834]/85 p-8 shadow-[0_20px_50px_rgba(3,7,20,0.55)] backdrop-blur-sm">
        <div className="absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border border-[#7ba1ff]/35 bg-[#132148] text-2xl font-bold text-[#a9c3ff] shadow-lg">
          🚚
        </div>
        <h2 className="mb-8 text-center text-3xl font-black text-[#eef2ff]">
          Register as a Mover
        </h2>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleFormSubmit(e).catch((err) => {
        console.error("Unhandled registration submit error:", err);
        setError("Registration failed. Please try again.");
        setUploadingCreds(false);
        setRegistrationStep("");
      });
    }}
    className="space-y-6"
  >
          {/* Credential Upload Field */}
          <div>
            <label className="mb-1 block font-medium text-[#d7e0ff]">Upload Credentials (License, Insurance, etc.)</label>
            <input
              type="file"
              multiple
              onChange={e => setCredentialFiles(e.target.files)}
              className="w-full rounded-xl border border-[#7ba1ff]/40 bg-[#132148] px-6 py-2 text-[#eef2ff]"
              disabled={uploadingCreds}
            />
            {credentialFiles && credentialFiles.length > 0 && (
              <p className="mt-1 text-sm text-[#b8c8f3]">
                {credentialFiles.length} file(s) selected
              </p>
            )}
            {uploadingCreds && registrationStep && (
              <p className="mt-1 animate-pulse text-[#ffd48d]">
                {registrationStep}
              </p>
            )}
          </div>
          {/** Company Name Field */}
          <div>
            <input
              type="text"
              {...register("companyName", { required: "Company name is required" })}
              placeholder="Company Name"
              className="w-full rounded-xl border border-[#7ba1ff]/40 bg-[#132148] px-6 py-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
            )}
          </div>

          {/** Service Area Field */}
          <div>
            <input
              type="text"
              {...register("serviceArea", { required: "Service area is required" })}
              placeholder="Service Area"
              className="w-full rounded-xl border border-[#7ba1ff]/40 bg-[#132148] px-6 py-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
            {errors.serviceArea && (
              <p className="text-red-500 text-sm mt-1">{errors.serviceArea.message}</p>
            )}
          </div>

          {/** Contact Number Field */}
          <div>
            <input
              type="text"
              {...register("contactNumber", { required: "Contact number is required" })}
              placeholder="Contact Number"
              className="w-full rounded-xl border border-[#7ba1ff]/40 bg-[#132148] px-6 py-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>
            )}
          </div>

          {/** Email Field */}
          <div>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="Email Address"
              className="w-full rounded-xl border border-[#7ba1ff]/40 bg-[#132148] px-6 py-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/** Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              placeholder="Create a Password"
              className="w-full rounded-xl border border-[#7ba1ff]/40 bg-[#132148] px-6 py-3 text-[#eef2ff] placeholder-[#95a5d3] focus:outline-none focus:ring-2 focus:ring-[#7ba1ff]/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 text-[#9fb8ff] hover:text-[#c4d4ff] focus:outline-none"
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/** Submit Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#7ba1ff] py-3 font-bold text-[#08112b] shadow-lg transition hover:bg-[#9bb7ff] focus:ring-2 focus:ring-[#7ba1ff]/40"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {success && (
          <div className="mt-6 rounded border border-[#7de3ba]/45 bg-[#7de3ba]/12 p-3 text-center text-[#d7ffef]">
            Registration Successful! Redirecting to login...
          </div>
        )}
        {error && (
          <div className="mt-6 rounded border border-[#ff8f9f]/45 bg-[#ff8f9f]/15 p-3 text-center text-[#ffd4db]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoverRegisterForm;
