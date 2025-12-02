"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  policy: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
    policy: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    console.log("Changing", name, value, type);
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked } as FormState));
    } else {
      setForm((p) => ({ ...p, [name]: value } as FormState));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError(null);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });

      // Safely parse response body. Some responses might be empty or non-JSON.
      const text = await res.text();
      let json: any = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch (err) {
          // non-JSON body (ignore)
          json = { raw: text };
        }
      }

      if (!res.ok) {
        // prefer message from JSON if available, else fallback to status text or raw body
        const message = json?.message || json?.error || res.statusText || (json?.raw ? String(json.raw) : "Registration failed");
        setServerError(message);
        setLoading(false);
        return;
      }

      // Success: redirect to login (or show success UI)
      setLoading(false);
      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="flex h-auto min-h-screen items-center justify-center overflow-x-hidden bg-[url('https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/auth/auth-background-2.png')] bg-cover bg-center bg-no-repeat py-10"
    >
      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute pointer-events-none">
          {/* keep your SVG here if needed */}
          <svg width="612" height="697" viewBox="0 0 612 697" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* ...original SVG paths... */}
          </svg>
        </div>

        <div className="bg-base-100 shadow-base-300/20 z-10 w-full space-y-6 rounded-xl p-6 shadow-md sm:min-w-md lg:p-8">
          <div className="flex items-center gap-3">
            <img src="https://cdn.flyonui.com/fy-assets/logo/logo.png" className="size-8" alt="brand-logo" />
            <h2 className="text-base-content text-xl font-bold">FlyonUI</h2>
          </div>

          <div>
            <h3 className="text-base-content mb-1.5 text-2xl font-semibold">Sign Up to FlyonUI</h3>
            <p className="text-base-content/80">Ship Faster and Focus on Growth.</p>
          </div>

          <div className="space-y-4">
            <form className="mb-4 space-y-4" noValidate onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="label-text">First name*</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter your first name"
                    className="input"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="label-text">Last name*</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter your last name"
                    className="input"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="userEmail" className="label-text">Email address*</label>
                <input
                  id="userEmail"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter your email address"
                  className="input"
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
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="············"
                    className="w-full"
                    autoComplete="new-password"
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

              <div>
                <label className="label-text">Role*</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
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

              <button
                className="btn btn-lg btn-primary btn-gradient btn-block"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up to FlyonUI"}
              </button>
            </form>

            <p className="text-base-content/80 mb-4 text-center">
              Already have an account?
              <a href="/login" className="link link-animated link-primary font-normal"> Sign in instead</a>
            </p>

          
          </div>
        </div>
      </div>
    </div>
  );
}
