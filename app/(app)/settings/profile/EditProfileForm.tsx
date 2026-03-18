"use client";

import { Field, Button, Alert, Spinner, Avatar } from "@orion-ds/react/client";
import { updateProfileAction } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef } from "react";

interface EditProfileFormProps {
  initialName: string;
  initialEmail: string;
  initialAvatarUrl?: string;
  userId: string;
}

export function EditProfileForm({
  initialName,
  initialEmail,
  initialAvatarUrl = "",
  userId,
}: EditProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate initials for fallback
  const initials = (initialName || initialEmail.split("@")[0])
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setAvatarUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const newAvatarUrl = urlData.publicUrl;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl },
      });

      if (updateError) {
        setError(`Failed to save avatar: ${updateError.message}`);
        setAvatarUploading(false);
        return;
      }

      // Upsert avatar URL to profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        avatar_url: newAvatarUrl,
      });

      if (profileError) {
        setError(`Failed to save profile: ${profileError.message}`);
        setAvatarUploading(false);
        return;
      }

      setAvatarUrl(newAvatarUrl);
      setAvatarUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      setAvatarUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setEmailChanged(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(true);
      setEmailChanged(result.emailChanged || false);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
      {/* Avatar Upload Section */}
      <div
        className="flex justify-center cursor-pointer hover:opacity-80 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar size="profile" src={avatarUrl} initials={initials} interactive />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        disabled={avatarUploading}
        style={{ display: "none" }}
      />
      {avatarUploading && <p className="text-xs text-tertiary text-center">Uploading...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <Field
          label="Display Name"
          type="text"
          name="name"
          placeholder="Your name"
          defaultValue={initialName}
          required
        />

        <div>
          <Field
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            defaultValue={initialEmail}
            required
          />
          <p className="text-xs text-tertiary mt-2">
            Changing your email will require confirmation — you'll receive a confirmation link
          </p>
        </div>
      </div>

      {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          {emailChanged
            ? "Profile updated! Check your email to confirm the new address."
            : "Profile updated successfully"}
        </Alert>
      )}

      <Button
        variant="primary"
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            Saving...
          </span>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
