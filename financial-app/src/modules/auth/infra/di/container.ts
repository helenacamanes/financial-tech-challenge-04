import { FirebaseAuthDatasource }
  from "../datasource/FirebaseAuthDatasource";

import { AuthRepositoryImpl }
  from "@/modules/auth/infra/repositories/AuthRepositoryImpl";

import { LoginUseCase }
  from "../../domain/usecases/loginUseCase";

import { RegisterUseCase }
  from "../../domain/usecases/registerUseCase";

import { LogoutUseCase }
  from "../../domain/usecases/logoutUseCase";

import { ResetPasswordUseCase }
  from "../../domain/usecases/resetPasswordUseCase";

import { ChangePasswordUseCase }
  from "../../domain/usecases/changePasswordUseCase";

import { ObserveAuthStateUseCase }
  from "../../domain/usecases/observeAuthStateUseCase";

const authDatasource =
  new FirebaseAuthDatasource();

const authRepository =
  new AuthRepositoryImpl(
    authDatasource,
  );

export const loginUseCase =
  new LoginUseCase(
    authRepository,
  );

export const registerUseCase =
  new RegisterUseCase(
    authRepository,
  );

export const logoutUseCase =
  new LogoutUseCase(
    authRepository,
  );

export const resetPasswordUseCase =
  new ResetPasswordUseCase(
    authRepository,
  );

export const changePasswordUseCase =
  new ChangePasswordUseCase(
    authRepository,
  );

export const observeAuthStateUseCase =
  new ObserveAuthStateUseCase(
    authRepository,
  );
