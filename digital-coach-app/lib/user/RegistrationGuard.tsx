// import { WithRouterProps } from "next/dist/client/with-router";
// import { withRouter } from "next/router";
// import { PropsWithChildren, useEffect } from "react";
// import useAuthContext from "@App/lib/auth/AuthContext";
// import AuthService from "@App/lib/auth/AuthService";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@App/lib/auth/AuthContextProvider";

/**
 * Prevents guests (users who don't have accounts) and fully logged in users from accessing the profile creation page (i.e. /register).
 * 
 * Guests get redirected to /login.
 * Users with complete profiles get redirected to the homepage. Otherwise, they go to /register to complete their profile.
 */
export default function RegistrationGuard({children}: {children: React.ReactNode}){
  const {user, userData, loading } = useAuth(); // extract relevant user authentication data
  const router = useRouter();

  useEffect(() => {
    // wait for authentication check to complete
    if (!loading) {
      // if the user isn't logged in, redirect them to login page 
      if (!user) {
        router.replace("/auth/login");
        return;
      } 

      // if the user is logged in and they completed their profile, redirect to dashboard (i.e. homepage)
      if (userData?.registrationCompletedAt) {
          router.replace("/");
      } else {
        // user is logged in but didn't complete their profile
        router.replace("/auth/register");
      }
      
    }
  }, [user, userData, loading, router]);

  // show nothing while waiting for authentication
  if (loading || !user || userData?.registrationCompletedAt) {
    return null;
  }

  // only show children (i.e. registration page) if the user is logged in but didn't complete their profile
  return <>{children}</>;
}

// function RegistrationGuard({
//   children,
//   router,
// }: PropsWithChildren<WithRouterProps>) {
//   const { currentUser } = useAuthContext();

//   useEffect(() => {
//     const isAuthPage = router.pathname === "/auth/login" || router.pathname === "/auth/signup";
//     if (!AuthService.auth.currentUser && !isAuthPage) router.push("/auth/login");
//     if (currentUser?.data()?.registrationCompletedAt) router.push("/");
//   });

//   return <>{children}</>;
// }

// export default withRouter(RegistrationGuard);
