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
      } 
      // user is logged in but didn't complete their profile
      // we check whether they're already in /auth/register to prevent cancelling out a redirect to the homepage when the user presses the submit button
      else if (router.pathname !== "/auth/register") {
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