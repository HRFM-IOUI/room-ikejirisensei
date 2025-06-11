// src/hooks/useAdminClaims.ts
import { useEffect, useState } from "react";
import { auth } from "../firebase";

export function useAdminClaims() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClaims = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdTokenResult(true); // ← claims取得
        setIsAdmin(token.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkClaims();
  }, [auth.currentUser]);

  return [isAdmin, loading] as const;
}
