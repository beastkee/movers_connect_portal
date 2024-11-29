import React, { useState } from "react";

interface RegistrationFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});
  const [success, setSuccess] = useState<string>("");

  const validate = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};
    if (!formData.username) newErrors.username = "Username is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (validate()) {
      // Replace this with API call logic for user registration
      console.log("Form Data Submitted:", formData);
      setSuccess("Registration successful!");
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Register</h1>
        {success && <p className="text-sm text-green-600">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-gray-800 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
            />
            {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-gray-800 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-gray-800 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 text-gray-800 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
