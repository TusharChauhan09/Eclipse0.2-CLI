import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      AuthLayout
      <div>{children}</div>
    </div>
  );
};

export default AuthLayout;
