import { FirebaseAuthDatasource }
  from "../../modules/auth/infra/datasource/FirebaseAuthDatasource";

import { AuthRepositoryImpl }
  from "@/modules/auth/infra/repositories/AuthRepositoryImpl";

import { LoginUseCase }
  from "@/modules/auth/domain/usecases/loginUseCase";

import { RegisterUseCase }
  from "@/modules/auth/domain/usecases/registerUseCase";

import { LogoutUseCase }
  from "@/modules/auth/domain/usecases/logoutUseCase";

import { ResetPasswordUseCase }
  from "@/modules/auth/domain/usecases/resetPasswordUseCase";

import { ChangePasswordUseCase }
  from "@/modules/auth/domain/usecases/changePasswordUseCase";

import { ObserveAuthStateUseCase }
  from "@/modules/auth/domain/usecases/observeAuthStateUseCase";

import { FirebaseGoalsDatasource }
  from "@/modules/goals/infra/datasources/FirebaseGoalDatasource";

import { GoalsRepositoryImpl }
  from "@/modules/goals/infra/repositories/GoalsRepositoryImpl";

import { CreateGoalUseCase }
  from "@/modules/goals/domain/usecases/createGoalsUseCase";

import { UpdateGoalUseCase }
  from "@/modules/goals/domain/usecases/updateGoalUseCase";

import { DeleteGoalUseCase }
  from "@/modules/goals/domain/usecases/deleteGoalUseCase";

import { SubscribeToGoalsUseCase }
  from "@/modules/goals/domain/usecases/subscribeToGoalsUseCase";

import { FirebaseTransactionsDatasource }
  from "@/modules/transactions/infra/datasources/FirebaseTransactionsDatasource";

import { TransactionsRepositoryImpl }
  from "@/modules/transactions/infra/repositories/TransactionsRepositoryImpl";

import { CreateTransactionUseCase }
  from "@/modules/transactions/domain/usecases/createTransactionUseCase";

import { UpdateTransactionUseCase }
  from "@/modules/transactions/domain/usecases/updateTransactionUseCase";

import { DeleteTransactionUseCase }
  from "@/modules/transactions/domain/usecases/deleteTransactionUseCase";

import { GetTransactionsUseCase }
  from "@/modules/transactions/domain/usecases/getTransactionsUseCase";

import { GetTransactionsInDateRangeUseCase }
  from "@/modules/transactions/domain/usecases/getTransactionsInDateRangeUseCase";

import { AsyncStorageOnboardingDatasource }
  from "@/modules/onboarding/infra/datasources/AsyncStorageOnboardingDatasource";

import { OnboardingRepositoryImpl }
  from "@/modules/onboarding/infra/repositories/OnboardingRepositoryImpl";

import { GetOnboardingStatusUseCase }
  from "@/modules/onboarding/domain/usecases/getOnboardingStatusUseCase";

import { CompleteOnboardingUseCase }
  from "@/modules/onboarding/domain/usecases/completeOnboardingUseCase";

import { ResetOnboardingUseCase }
  from "@/modules/onboarding/domain/usecases/resetOnboardingUseCase";

import { BuildHomeDashboardUseCase }
  from "@/modules/home/domain/usecases/buildHomeDashboardUseCase";

import { ExpoPdfReportDatasource }
  from "@/modules/home/infra/datasources/ExpoPdfReportDatasource";

import { HomeReportRepositoryImpl }
  from "@/modules/home/infra/repositories/HomeReportRepositoryImpl";

import { ExportMonthlyReportUseCase }
  from "@/modules/home/domain/usecases/exportMonthlyReportUseCase";

import { BuildInsightsDashboardUseCase }
  from "@/modules/insights/domain/usecases/buildInsightsDashboardUseCase";

import { BuildProfileSummaryUseCase }
  from "@/modules/profile/domain/usecases/buildProfileSummaryUseCase";

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

const goalsDatasource =
  new FirebaseGoalsDatasource();

const goalsRepository =
  new GoalsRepositoryImpl(
    goalsDatasource,
  );

export const createGoalUseCase =
  new CreateGoalUseCase(
    goalsRepository,
  );

export const updateGoalUseCase =
  new UpdateGoalUseCase(
    goalsRepository,
  );

export const deleteGoalUseCase =
  new DeleteGoalUseCase(
    goalsRepository,
  );

export const subscribeToGoalsUseCase =
  new SubscribeToGoalsUseCase(
    goalsRepository,
  );

const transactionsDatasource =
  new FirebaseTransactionsDatasource();

const transactionsRepository =
  new TransactionsRepositoryImpl(
    transactionsDatasource,
  );

export const createTransactionUseCase =
  new CreateTransactionUseCase(
    transactionsRepository,
  );

export const updateTransactionUseCase =
  new UpdateTransactionUseCase(
    transactionsRepository,
  );

export const deleteTransactionUseCase =
  new DeleteTransactionUseCase(
    transactionsRepository,
  );

export const getTransactionsUseCase =
  new GetTransactionsUseCase(
    transactionsRepository,
  );

export const getTransactionsInDateRangeUseCase =
  new GetTransactionsInDateRangeUseCase(
    transactionsRepository,
  );

const onboardingDatasource =
  new AsyncStorageOnboardingDatasource();

const onboardingRepository =
  new OnboardingRepositoryImpl(
    onboardingDatasource,
  );

export const getOnboardingStatusUseCase =
  new GetOnboardingStatusUseCase(
    onboardingRepository,
  );

export const completeOnboardingUseCase =
  new CompleteOnboardingUseCase(
    onboardingRepository,
  );

export const resetOnboardingUseCase =
  new ResetOnboardingUseCase(
    onboardingRepository,
  );

export const buildHomeDashboardUseCase =
  new BuildHomeDashboardUseCase();

const homeReportDatasource =
  new ExpoPdfReportDatasource();

const homeReportRepository =
  new HomeReportRepositoryImpl(
    homeReportDatasource,
  );

export const exportMonthlyReportUseCase =
  new ExportMonthlyReportUseCase(
    homeReportRepository,
  );

export const buildInsightsDashboardUseCase =
  new BuildInsightsDashboardUseCase();

export const buildProfileSummaryUseCase =
  new BuildProfileSummaryUseCase();
