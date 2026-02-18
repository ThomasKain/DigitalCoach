import { useForm } from "react-hook-form";
// import useAuthContext from "@App/lib/auth/AuthContext";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import RegistrationGuard from "@App/lib/user/RegistrationGuard";
import Button from "@App/components/atoms/Button";
import { Select } from "@App/components/Select";
// import UserService from "@App/lib/user/UserService";
import styles from "@App/styles/RegisterPage.module.scss";
// import { EStorageFolders, } from "@App/lib/storage/StorageService";
import {
  IBaseUserAttributes,
  EUserConcentrations,
  EUserProficiencies,
} from "@App/lib/user/models";
import { TextField } from "@App/components/molecules/TextField";

import { useRouter } from "next/router";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import { registerUser } from "@App/lib/user/UserService";
import { uploadFile, EStorageFolders } from "@App/lib/storage/StorageService";
import { EarbudsBatterySharp } from "@mui/icons-material";

interface RegFormInputs extends IBaseUserAttributes {
  avatar: FileList;
}

const inputValidationSchema = yup
  .object({
    name: yup.string().max(255).required("Name is required"),
    concentration: yup.string().max(255).required("Concentration is required"),
    proficiency: yup.string().max(255).required("Proficiency is required"),
  })
  .required();

export default function RegisterPage() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors: formError, isSubmitting }, 
  } = useForm<RegFormInputs>({
    mode: "onSubmit",
    resolver: yupResolver(inputValidationSchema),
  });

  const onSubmit = async (data: RegFormInputs) => {
    if (!user) return;
    try {
      const { name, concentration, proficiency } = data;
      // upload avatar
      const avatarUrl = await uploadFile(
        data.avatar[0],
        EStorageFolders.profilePic, // use profile picture folder
        user.uid, // use authentication ID for filename 
      );

      // update firestore profile
      await registerUser(user.uid, {
        name,
        concentration,
        proficiency,
        avatarUrl,
      });

      // refresh homepage to get updated profile data
      window.location.href = "/";

    } catch (e) {
      console.error("Registration failed", e);
      alert("Something went wrong. Please try again.");
    }
  };


  return (
    <RegistrationGuard>
      <div className={styles.registerBox}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h1>Register</h1>

          <label>Select a profile picture:</label>
          <input type="file" id="profilePic" required accept="image/*" {...register("avatar")} />

          <label>Enter your name:</label>
          <TextField placeholder="Full Name" {...register("name")}/>
          {formError.name && <span>{formError.name.message}</span>}

          <label>Select a concentration:</label>
          <Select {...register("concentration")}>
            {Object.values(EUserConcentrations).map((concentration) => (
              <option value={concentration} key={concentration}>
                {concentration}
              </option>
            ))}
            </Select>
          {formError.concentration && (
            <span>{formError.concentration.message}</span>
          )}

          <label>Select a proficiency:</label>
          <select {...register("proficiency")}>
            {Object.values(EUserProficiencies).map((proficiency) => (
              <option value={proficiency} key={proficiency}>
                {proficiency}
              </option>
            ))}
          </select>
          {formError.proficiency && (
            <span>{formError.proficiency.message}</span>
          )}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign up" }
          </Button>
        </form>
      </div>
    </RegistrationGuard>
  );
}