import { WithRouterProps } from "next/dist/client/with-router";
import { withRouter } from "next/router";
import { PropsWithChildren, useEffect } from "react";
import useAuthContext from "@App/lib/auth/AuthContext";
import AuthService from "@App/lib/auth/AuthService";

function RegistrationGuard({
  children,
  router,
}: PropsWithChildren<WithRouterProps>) {
  const { currentUser } = useAuthContext();

  useEffect(() => {
    const isAuthPage = router.pathname === "/auth/login" || router.pathname === "/auth/signup";
    if (!AuthService.auth.currentUser && !isAuthPage) router.push("/auth/login");
    if (currentUser?.data()?.registrationCompletedAt) router.push("/");
  });

  return <>{children}</>;
}

export default withRouter(RegistrationGuard);
