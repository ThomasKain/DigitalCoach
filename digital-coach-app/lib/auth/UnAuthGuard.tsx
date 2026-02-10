import { WithRouterProps } from "next/dist/client/with-router";
import { withRouter } from "next/router";
import { PropsWithChildren, useEffect } from "react";
import AuthService from "./AuthService";
import UserService from "../user/UserService";

function UnAuthGuard({ children, router }: PropsWithChildren<WithRouterProps>) {

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      // if (!!user) router.push("/");
      if (!!user && isMounted) {
      
        try {
        // get user doc to check registration status
        const userDoc = await UserService.getUser(user.uid);
        if (!isMounted) return; // Check after async operation
        
        if (userDoc.exists()) {
          // if the user is authenticated but still needs to finish profile registration, go to register page
          if (!userDoc.data()?.registrationCompletedAt) {
            router.push("/auth/register");
          } 
          else {
            // authenticated user has completed profile registration, go home
            router.push("/");
          }
        } else {
          // if user document doesn't exist, redirect to register page
          router.push("/auth/register");
        }
        
       } catch (error) {
          // cant find user doc
          console.error("Error fetching user document:", error);
       } 
      } 
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [router]);

  return <>{children}</>;
}

export default withRouter(UnAuthGuard);
