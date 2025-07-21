import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

// Icons
import { 
  MdEmail, 
  MdLock, 
  MdPerson, 
  MdVisibility, 
  MdVisibilityOff,
  MdBadge
} from "react-icons/md";

import LoadingSpinner from "../../../components/common/LoadingSpinner";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: async ({ email, username, fullName, password }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, fullName, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-primary-content font-bold text-2xl">F</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Join FriendsOrbit
          </h1>
          <p className="text-base-content/60">
            Create your account and start connecting
          </p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-base-100 shadow-xl border border-base-300"
        >
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="input input-bordered w-full pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Username & Full Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Username</span>
                  </label>
                  <div className="relative">
                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      className="input input-bordered w-full pl-10"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <div className="relative">
                    <MdBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      className="input input-bordered w-full pl-10"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    className="input input-bordered w-full pl-10 pr-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content"
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Must be at least 8 characters
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn btn-primary w-full"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <div className="divider">Already have an account?</div>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-outline w-full"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm text-base-content/60"
        >
          <p>© 2024 FriendsOrbit. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;