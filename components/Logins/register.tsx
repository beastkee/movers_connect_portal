import React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { db } from "@/firebase/firebaseConfig"; // Firebase configuration file
import { collection, addDoc } from "firebase/firestore";

type FormData = {
  companyName: string;
  serviceArea: string;
  contactNumber: string;
  email: string;
  password: string;
};

const Register: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      // Add data to Firestore
      const docRef = await addDoc(collection(db, "movers"), {
        companyName: data.companyName,
        serviceArea: data.serviceArea,
        contactNumber: data.contactNumber,
        email: data.email,
        password: data.password, // You may want to hash this before storing
        createdAt: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);
      setSuccess(true);
      reset(); // Clear the form after submission
    } catch (err) {
      console.error("Error adding document: ", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">Register as a Mover</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block font-bold mb-1"> Company Name </label>
            <input
              type="text"
              {...register("companyName", { required: true })}
              placeholder="Enter your company name"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">Service Area</label>
            <input
              type="text"
              {...register("serviceArea", { required: true })}
              placeholder="Enter your service area"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">Contact Number</label>
            <input
              type="text"
              {...register("contactNumber", { required: true })}
              placeholder="Enter your contact number"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">Email Address</label>
            <input
              type="email"
              {...register("email", { required: true })}
              placeholder="Enter your email address"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-1">Create a Password</label>
            <input
              type="password"
              {...register("password", { required: true })}
              placeholder="Enter a strong password"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-purple-700 text-white py-2 px-4 rounded-lg hover:scale-105 transition-transform"
          >
            Register
          </button>
        </form>

        {success && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded">
            Registration Successful! Thank you for registering.
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
