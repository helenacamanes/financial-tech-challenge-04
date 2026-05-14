import { User } from "../entities/User";

export interface IAuthRepository {
  observeAuthState(
    callback: (user: User | null) => void,
  ): () => void;

  login(
    email: string,
    password: string,
  ): Promise<User>;

  register(
    email: string,
    password: string,
    name: string,
  ): Promise<User>;

  logout(): Promise<void>;

  forgotPassword(
    email: string,
  ): Promise<void>;

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;
}
