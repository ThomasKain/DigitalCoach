import React, { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/router";
import useAuthContext from "@App/lib/auth/AuthContext";
import AuthService from "@App/lib/auth/AuthService";

export default function AuthGuard({ children }: PropsWithChildren<{}>) {
  const { currentUser } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async () => {
      const isSignedIn = AuthService.isSignedIn();
      console.log("Is Signed In?", isSignedIn);
  
      const isAuthPage = router.pathname === "/auth/login" || router.pathname === "/auth/signup";
      if (!isSignedIn && !isAuthPage) router.push("/auth/login");
    });


    return () => unsubscribe?.();
  }, [currentUser, router]);

  if (!currentUser) return null;

  return <>{children}</>;
}
