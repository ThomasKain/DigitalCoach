// import { WithRouterProps } from "next/dist/client/with-router";
// import { withRouter } from "next/router";
// import { PropsWithChildren, useEffect } from "react";
// import AuthService from "./AuthService";
// import UserService from "../user/UserService";
// import { useAuth } from "@App/lib/auth/AuthContextProvider";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@App/lib/auth/AuthContextProvider";

/**
 * Prevents users who have an account (regardless of whether they completed their profile) from accessing the account creation pages, i.e. /signup and /login pages.
 * 
 * Users with completed profiles get redirected to the homepage. 
 * Users with incomplete profiles get redirected to /register.
 */
export default function UnAuthGuard({children} : {children: React.ReactNode}) {
  const {user, userData, loading} = useAuth(); // extract relevant user data
  const router = useRouter();

  useEffect(() => {
    // if loading is done and we have a user, redirect them from public pages, e.g. login/register
    if (!loading && user) {
      // redirect based on profile status


      // user is logged in but profile is incomplete
      if (userData && !userData.registrationCompletedAt) {
        router.replace("/auth/register");
      } else {
        // user is logged in and fully registered
        router.replace("/");
      }
    }
  }, [user, userData, loading, router]);

  // while waiting for firebase to check whether user is logged in or if user is found, show loading page until redirection above occurs
  if (loading || user) { 
    // return null;
    return <div>Loading...</div>
  };

  // only render children if we can't find the user
  return <>{children}</>
}

// function UnAuthGuard({ children, router }: PropsWithChildren<WithRouterProps>) {
//   const { error: authError } = useAuth();
//   useEffect(() => {
//     let isMounted = true;
//     const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
//       // if (!!user) router.push("/");
//       if (!!user && isMounted) {
//         // if (router.pathname === "/auth/signup" && authError) return;
//         const currentPath = typeof window !== "undefined" ? window.location.pathname : router.pathname;
//         if (currentPath === "/auth/signup") return;

//         try {
//         // get user doc to check registration status
//         const userDoc = await UserService.getUser(user.uid);
//         if (!isMounted) return; // Check after async operation
        
//         if (userDoc.exists()) {
//           // if the user is authenticated but still needs to finish profile registration, go to register page
//           if (!userDoc.data()?.registrationCompletedAt) {
//             router.push("/auth/register");
//           } 
//           else {
//             // authenticated user has completed profile registration, go home
//             router.push("/");
//           }
//         } else {
//           // if user document doesn't exist, redirect to register page
//           router.push("/auth/register");
//         }
        
//        } catch (error) {
//           // cant find user doc
//           console.error("Error fetching user document:", error);
//        } 
//       } 
//     });

//     return () => {
//       isMounted = false;
//       unsubscribe?.();
//     };
//   }, [router, authError]);

//   return <>{children}</>;
// }

// export default withRouter(UnAuthGuard);
