// AdminProfilePage.tsx
'use client';

import React, { useEffect, useState } from 'react';

type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  mobile?: string;
  status?: string;
};

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<User | null>(null);

  // Load user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const u = data?.data;
        if (!u) return setError('Unable to load profile');

        setForm({
          _id: u._id,
          email: u.email ?? '',
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          fullName: u.fullName ?? `${u.firstName} ${u.lastName}`,
          mobile: u.mobile ?? '',
          status: u.status ?? '',
        });
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (key: keyof User, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFormErrors((prev) => ({ ...prev, [key]: '' }));
    setMessage(null);
  };

  const validate = () => {
    if (!form) return false;
    const e: Record<string, string> = {};

    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email || '')) e.email = 'Valid email required';
    if (!form.mobile?.trim()) e.mobile = 'Mobile number is required';
    if (!form.status?.trim()) e.status = 'Status is required';

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !validate()) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Save failed');

      setMessage('Profile saved successfully.');
    } catch {
      setMessage('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!form) return <div className="p-6">No profile data</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-md shadow p-6">
        <h1 className="text-xl font-semibold mb-6">Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* First + Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <label className="block">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>First Name</span>
                <span className="text-red-500">*</span>
              </div>
              <input
                value={form.firstName || ''}
                onChange={(e) => onChange('firstName', e.target.value)}
                placeholder="First name"
                className={`w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                  formErrors.firstName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {formErrors.firstName && (
                <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
              )}
            </label>

            {/* Last Name */}
            <label className="block">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Last Name</span>
                <span className="text-red-500">*</span>
              </div>
              <input
                value={form.lastName || ''}
                onChange={(e) => onChange('lastName', e.target.value)}
                placeholder="Last name"
                className={`w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                  formErrors.lastName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {formErrors.lastName && (
                <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
              )}
            </label>
          </div>

          {/* Email + Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <label className="block">
              <div className="text-sm mb-1">Email</div>
              <input
                value={form.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="example@gmail.com"
                type="email"
                className={`w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                  formErrors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
              )}
            </label>

            {/* Mobile */}
            <label className="block">
              <div className="text-sm mb-1 flex items-center gap-2">
                <span>Mobile Number</span>
                <span className="text-red-500">*</span>
              </div>

              <div className="flex">
                <div className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-200 bg-gray-50 text-sm">
                  <span className="mr-2">🇳🇬</span>
                  <span className="text-xs">+234</span>
                </div>
                <input
                  value={form.mobile || ''}
                  onChange={(e) => onChange('mobile', e.target.value)}
                  placeholder="0806 123 7890"
                  className={`flex-1 rounded-r border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                    formErrors.mobile ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>

              {formErrors.mobile && (
                <p className="text-xs text-red-500 mt-1">{formErrors.mobile}</p>
              )}
            </label>
          </div>

          {/* Status */}
          <label className="block">
            <div className="text-sm mb-1 flex items-center justify-between">
              <span>Status</span>
              <span className="text-red-500">*</span>
            </div>
            <input
              value={form.status || ''}
              onChange={(e) => onChange('status', e.target.value)}
              placeholder="Active / Inactive / Pending"
              className={`w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${
                formErrors.status ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {formErrors.status && (
              <p className="text-xs text-red-500 mt-1">{formErrors.status}</p>
            )}
          </label>

        
        </form>
      </div>
    </div>
  );
}
