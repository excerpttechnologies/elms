"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

type LoginForm = {
  email: string;
  password: string;
  policy: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "", policy: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value } as LoginForm));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  function validate() {
    const errs: Partial<Record<keyof LoginForm, string>> = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    if (!form.policy) errs.policy = "You must agree to the privacy policy";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      });

      // Safely parse response (handles empty or non-JSON bodies)
      const text = await res.text();
      let json: any = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = { raw: text };
        }
      }

      if (!res.ok) {
        const message = json?.message || res.statusText || (json?.raw ? String(json.raw) : "Login failed");
        setServerError(message);
        setLoading(false);
        return;
      }

      console.log("Login successful:", json?.data?.user?.role);

      // Store token
      const token = json?.data?.accessToken;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Store user data
      const user = json?.data?.user;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Notify other parts of the app that login happened (Navbar will listen)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:login"));
      }

      // Get user role and navigate accordingly
      const userRole = user?.role?.toLowerCase();
      
      let redirectPath = "/dashboard"; // default fallback

      switch (userRole) {
        case "admin":
          redirectPath = "/dashboard/admin";
          break;
        case "teacher":
          redirectPath = "/dashboard/teacher";
          break;
        case "student":
          redirectPath = "/dashboard/student";
          break;
        default:
          console.warn(`Unknown role: ${userRole}, redirecting to default dashboard`);
          redirectPath = "/dashboard";
      }

      setLoading(false);
      router.push(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
    <Navbar/>
    
    <div
      className="flex h-auto min-h-screen items-center justify-center overflow-x-hidden bg-[url('https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/auth/auth-background-2.png')] bg-cover bg-center bg-no-repeat py-10"
    >
      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute pointer-events-none">
          {/* keep SVG here if desired */}
        </div>

        <div className="bg-base-100 shadow-base-300/20 z-10 w-full space-y-6 rounded-xl p-6 shadow-md sm:min-w-md lg:p-8">
          <div className="flex items-center gap-3">
            <img src="https://cdn.flyonui.com/fy-assets/logo/logo.png" className="size-8" alt="brand-logo" />
            <h2 className="text-base-content text-xl font-bold">FlyonUI</h2>
          </div>

          <div>
            <h3 className="text-base-content mb-1.5 text-2xl font-semibold">Sign in to FlyonUI</h3>
            <p className="text-base-content/80">Ship Faster and Focus on Growth.</p>
          </div>

          <div className="space-y-4">
            <form className="mb-4 space-y-4" noValidate onSubmit={handleSubmit}>
              <div>
                <label htmlFor="userEmail" className="label-text">Email address*</label>
                <input
                  id="userEmail"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="userPassword" className="label-text">Password*</label>
                <div className="input flex items-center justify-between">
                  <input
                    id="userPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full"
                    placeholder="············"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="block cursor-pointer ml-3"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <span className="icon-[tabler--eye] size-5" /> : <span className="icon-[tabler--eye-off] size-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="policyagreement"
                  name="policy"
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={form.policy}
                  onChange={handleChange}
                />
                <label htmlFor="policyagreement" className="label-text text-base-content/80 p-0 text-base">
                  I agree to{" "}
                  <a href="#" className="link link-animated link-primary font-normal">privacy policy & terms?</a>
                </label>
              </div>
              {errors.policy && <p className="text-sm text-red-500 mt-1">{errors.policy}</p>}

              {serverError && <p className="text-sm text-red-500 mt-1">{serverError}</p>}

              <button className="btn btn-lg btn-primary btn-gradient btn-block" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-base-content/80 mb-4 text-center">
              Don't have an account?
              <a href="/register" className="link link-animated link-primary font-normal"> Sign up instead</a>
            </p>

          
          </div>
        </div>
      </div>
    </div>

    </>
  );
}
