import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { registerUser } from "../authSlice";
import { useEffect, useState } from "react";

const signupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-gray-200 relative">
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl p-8">
        {/* Header toggle */}
        <div className="flex justify-center items-center mb-6">
          <button className="px-8 py-4 rounded-lg text-2xl  text-white font-bold">
            Leetcode 🚀
          </button>
        </div>

        <h2 className="text-xl flex justify-center items-center font-medium mb-6">
          Create an account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="flex space-x-2">
            <input
              {...register("firstName")}
              placeholder="First name"
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-indigo-500 outline-none"
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}

          {/* Email */}
          <input
            type="email"
            {...register("email")}
            placeholder="john@example.com "
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-indigo-500 outline-none"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}

          {/* Password */}
          <div className="relative">
            {" "}
            {/* Add a relative container for the input and icon */}
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-indigo-500 outline-none pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 px-4 text-black font-semibold bg-white hover:bg-gray-200 rounded-lg transition"
          >
            Create an account
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-white font-semibold">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
