"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";

const DeviceAuthPage = () => {
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    formData.preventDefault();
  };
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-4">
      <form action={handleSubmit}>
        <input
          type="text"
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
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
