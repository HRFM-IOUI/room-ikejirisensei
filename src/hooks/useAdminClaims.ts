import { useEffect, useState } from "react";
import { auth } from "../firebase";

/**
 * 管理者クレーム判定フック
 * @returns [isAdmin: boolean, loading: boolean]
 */
export function useAdminClaims() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClaims = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdTokenResult(true); // claims取得
        setIsAdmin(token.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkClaims();
    // auth自体のみ依存。currentUserは内部管理で十分
  }, [auth]);

  return [isAdmin, loading] as const;
}
