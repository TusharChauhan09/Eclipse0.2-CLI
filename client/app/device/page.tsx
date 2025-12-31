"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const DeviceAuthPage = () => {
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: React.FormEvent<HTMLFormElement>) => {
    formData.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase();
      const response = await authClient.device({
        query: {
          user_code: formattedCode,
        },
      });
      if (response.data) {
        router.push(`/approve?user_code=${formattedCode}`);
      }
    } catch (error) {
      setError("Invalid or Expired Code");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4, 8);
    }
    setUserCode(value);
  };
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userCode}
          onChange={(e) => handleCodeChange(e)}
          placeholder="XXXX-XXXX"
          maxLength={9}
        />

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading || userCode.length < 9}>
          {isLoading ? "Verifying..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default DeviceAuthPage;
