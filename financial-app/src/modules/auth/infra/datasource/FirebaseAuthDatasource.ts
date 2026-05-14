import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth }
  from "@/infra/firebase/firebaseConfig";

export class FirebaseAuthDatasource {
  observeAuthState(
    callback: (user: FirebaseUser | null) => void,
  ) {
    return onAuthStateChanged(
      auth,
      callback,
    );
  }

  async login(
    email: string,
    password: string,
  ) {
    return signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
  }

  async register(
    email: string,
    password: string,
    name: string,
  ) {
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

    await updateProfile(
      credential.user,
      {
        displayName: name,
      },
    );

    return credential;
  }

  async logout() {
    return signOut(auth);
  }

  async forgotPassword(
    email: string,
  ) {
    return sendPasswordResetEmail(
      auth,
      email,
    );
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ) {
    const user = auth.currentUser;

    if (!user?.email) {
      throw new Error("Usuário não autenticado.");
    }

    const credential =
      EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

    await reauthenticateWithCredential(
      user,
      credential,
    );

    await updatePassword(
      user,
      newPassword,
    );
  }
}
