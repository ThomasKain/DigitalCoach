import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import AuthService from "./AuthService";
import { AuthContext } from "./AuthContext";
import UserService from "../user/UserService";
import { IUser } from "../user/models";
import { DocumentSnapshot } from "firebase/firestore";

export function getAuthErrorMessage(error: { code?: string; message?: string }): string {
  const code = error?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "This email is already registered. Try logging in or use a different email.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters with upper and lowercase letters, a number, and a special character.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  return messages[code] ?? "Something went wrong. Please try again.";
}

export function AuthContextProvider({ children }: PropsWithChildren<{}>) {
  const [currentUser, setCurrentUser] =
    useState<DocumentSnapshot<IUser> | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocSnapshot = await UserService.getUser(user?.uid);

        setCurrentUser(userDocSnapshot);
      }
    });
  }, []);

  const providerValue = useMemo(() => {
    const login = async (email: string, password: string) => {
      try {
        const { user } = await AuthService.login(email, password);
        const userDocSnapshot = await UserService.getUser(user.uid);

        setCurrentUser(userDocSnapshot);
      } catch (error: any) {
        // setError(error.message);
        setError(getAuthErrorMessage(error));
      }
    };

    // const loginWithGoogle = async () => {
    //   try {
    //     const { user } = await AuthService.loginWithGoogle();
    //     const userDocSnapshot = await UserService.getUser(user.uid);

    //     setCurrentUser(userDocSnapshot);
    //   } catch (error: any) {
    //     setError(error.message);
    //   }
    // };

    const signup = async (email: string, password: string) => {
      try {
        const { user } = await AuthService.signup(email, password);

        await UserService.createNewUser(user);

        const userDocSnapshot = await UserService.getUser(user.uid);

        setCurrentUser(userDocSnapshot);
      } catch (error: any) {
        // setError(error.message);
        setError(getAuthErrorMessage(error));
      }
    };

    const logout = async () => {
      setCurrentUser(null);

      await AuthService.logout();
    };

    const fetchUser = async (userId: string = currentUser!.id) => {
      const userDocSnapshot = await UserService.getUser(userId);
      setCurrentUser(userDocSnapshot);
    };

    const clearError = () => {
      setError("");
    };

    return {
      currentUser,
      setCurrentUser,
      error,
      clearError,
      login,
      signup,
      // loginWithGoogle,
      logout,
      fetchUser,
    };
  }, [currentUser, setCurrentUser, error]);

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}
