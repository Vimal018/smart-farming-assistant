import { useState } from "react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login for Agribot" : "Sign Up for Agribot"}
        </h2>

        <form>
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Enter your email"
              autoComplete="email" // Added autocomplete for email
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"} // Conditional autocomplete
            />
          </div>

          {/* Confirm Password Field (only for signup) */}
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="confirm-password" className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                required
                className="w-full p-2 mt-2 border border-gray-300 rounded-lg"
                placeholder="Confirm your password"
                autoComplete="new-password" // Added autocomplete for confirm password
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>

          {/* Toggle between Login and Sign Up */}
          <div className="mt-4 text-center">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 cursor-pointer"
              >
                {isLogin ? " Sign Up" : " Login"}
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;