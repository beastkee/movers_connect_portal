import React, { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { db, auth } from "@/firebase/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";

type FormData = {
  companyName: string;
  serviceArea: string;
  contactNumber: string;
  email: string;
  password: string;
};


const Register: React.FC = () => {
  const { register, handleSubmit, reset, formState } = useForm<FormData>();
  const { errors, isSubmitting } = formState;
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [credentialFiles, setCredentialFiles] = useState<FileList | null>(null);
  const [uploadingCreds, setUploadingCreds] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<string>("");
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setUploadingCreds(true);
    setError(null);
    try {
      // Create the user in Firebase Authentication
      setRegistrationStep("Creating account...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Check if admin account (skip email verification during development)
      const isAdminEmail = data.email === "admin@admin.com";

      // Save the user's basic details in Firestore immediately
      setRegistrationStep("Setting up profile...");
      const userRef = doc(db, "users", user.uid, "movers", user.uid);
      await setDoc(userRef, {
        companyName: data.companyName,
        serviceArea: data.serviceArea,
        contactNumber: data.contactNumber,
        email: data.email,
        credentials: [],
        status: "available",
        verificationStatus: isAdminEmail ? "approved" : "pending", // Auto-approve admin
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

      // Send email verification (non-blocking, skip for admin)
      if (!isAdminEmail) {
        sendEmailVerification(user).catch((err: any) => {
          console.error("Error sending verification email:", err);
        });
      }

      setSuccess(true);
      reset();
      setCredentialFiles(null);

      // Inform user about the verification process
      const successMessage = isAdminEmail
        ? "Admin account created successfully! You can login immediately with full access."
        : "Registration successful! You can now login. Your credentials will be verified by an admin before you can receive bookings.";
      setError(successMessage);
      // Redirect after a delay
      setTimeout(() => router.push("/login"), isAdminEmail ? 2000 : 4000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in or use a different email address.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setUploadingCreds(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center">
      <div className="relative w-full max-w-lg mx-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-3xl shadow-lg p-10">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-white to-gray-200 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-2xl font-bold text-purple-800">
          🚚
        </div>
        <h2 className="text-3xl font-extrabold text-center text-white mb-8">
          Register as a Mover
        </h2>
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Credential Upload Field */}
          <div>
            <label className="block text-white font-medium mb-1">Upload Credentials (License, Insurance, etc.)</label>
            <input
              type="file"
              multiple
              onChange={e => setCredentialFiles(e.target.files)}
              className="w-full px-6 py-2 bg-transparent border border-purple-400 rounded-xl text-white"
              disabled={uploadingCreds}
            />
            {credentialFiles && credentialFiles.length > 0 && (
              <p className="text-purple-200 mt-1 text-sm">
                {credentialFiles.length} file(s) selected
              </p>
            )}
            {uploadingCreds && registrationStep && (
              <p className="text-yellow-300 mt-1 animate-pulse">
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
              className="w-full px-6 py-3 bg-transparent border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400"
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
              className="w-full px-6 py-3 bg-transparent border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400"
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
              className="w-full px-6 py-3 bg-transparent border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400"
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
              className="w-full px-6 py-3 bg-transparent border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400"
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
              className="w-full px-6 py-3 bg-transparent border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 text-purple-300 hover:text-purple-500 focus:outline-none"
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
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg hover:opacity-90 focus:ring-2 focus:ring-indigo-400 transition-opacity"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {success && (
          <div className="mt-6 bg-green-100 text-green-700 p-3 rounded text-center">
            Registration Successful! Redirecting to login...
          </div>
        )}
        {error && (
          <div className="mt-6 bg-red-100 text-red-700 p-3 rounded text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
