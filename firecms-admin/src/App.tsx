import React, { useCallback, useMemo } from "react";

import {
  AppBar,
  Authenticator,
  CircularProgressCenter,
  Drawer,
  FireCMS,
  FireCMSi18nProvider,
  ModeControllerProvider,
  NavigationRoutes,
  Scaffold,
  SideDialogs,
  SnackbarProvider,
  useBuildLocalConfigurationPersistence,
  useBuildModeController,
  useBuildNavigationController,
  useValidateAuthenticator,
} from "@firecms/core";

import {
  FirebaseAuthController,
  FirebaseLoginView,
  FirebaseSignInProvider,
  FirebaseUserWrapper,
  useFirebaseAuthController,
  useFirestoreDelegate,
  useInitialiseFirebase,
} from "@firecms/firebase";

import { CenteredView } from "@firecms/ui";

import { bannersCollection } from "./collections/banners";
import { categoriesCollection } from "./collections/categories";
import { ctaSlidesCollection } from "./collections/cta_slides";
import { faqsCollection } from "./collections/faqs";
import { mediaCollection } from "./collections/media";
import { postsCollection } from "./collections/posts";
import { productsCollection } from "./collections/products";
import { projectsCollection } from "./collections/projects";
import { testimonialsCollection } from "./collections/testimonials";
import { coreValuesCollection } from "./collections/core_values";
import { brandIntroductionsCollection } from "./collections/brand_introductions";
import { siteSettingsCollection } from "./collections/site_settings";
import { seoSettingsCollection } from "./collections/seo_settings";
import { workProcessCollection } from "./collections/work_process";
import { firebaseConfig } from "./firebase_config";
import { buildR2StorageSource } from "./storage/r2_storage_source";
import DatabaseSeeder from "./components/DatabaseSeeder";

const R2_API_BASE_URL = import.meta.env.VITE_R2_API_BASE_URL as
  | string
  | undefined;

const R2_PUBLIC_BASE_URL = import.meta.env.VITE_R2_PUBLIC_BASE_URL as
  | string
  | undefined;

function App() {
  const authenticator: Authenticator<FirebaseUserWrapper> = useCallback(
    async ({ user }) => Boolean(user?.email),
    []
  );

  const collections = useMemo(
    () => [
      categoriesCollection,
      productsCollection,
      projectsCollection,
      postsCollection,
      bannersCollection,
      ctaSlidesCollection,
      faqsCollection,
      testimonialsCollection,
      coreValuesCollection,
      brandIntroductionsCollection,
      workProcessCollection,
      siteSettingsCollection,
      seoSettingsCollection,
      mediaCollection,
    ],
    []
  );

  const { firebaseApp, firebaseConfigLoading, configError } =
    useInitialiseFirebase({
      firebaseConfig,
    });

  const modeController = useBuildModeController();

  const signInOptions: FirebaseSignInProvider[] = ["password"];

  const authController: FirebaseAuthController = useFirebaseAuthController({
    firebaseApp,
    signInOptions,
  });

  const userConfigPersistence = useBuildLocalConfigurationPersistence();

  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
  });

  const storageSource = useMemo(
    () =>
      buildR2StorageSource({
        apiBaseUrl: R2_API_BASE_URL ?? "",
        publicBaseUrl: R2_PUBLIC_BASE_URL ?? "",
        getAuthToken: () => authController.getAuthToken(),
        firebaseApp,
        getCurrentUserEmail: () => authController.user?.email ?? null,
      }),
    [authController, firebaseApp]
  );

  const { authLoading, canAccessMainView, notAllowedError } =
    useValidateAuthenticator({
      authController,
      authenticator,
      dataSourceDelegate: firestoreDelegate,
      storageSource,
    });

  const navigationController = useBuildNavigationController({
    disabled: authLoading,
    collections,
    authController,
    dataSourceDelegate: firestoreDelegate,
  });

  const r2ConfigError =
    !R2_API_BASE_URL || !R2_PUBLIC_BASE_URL
      ? "Thiếu VITE_R2_API_BASE_URL hoặc VITE_R2_PUBLIC_BASE_URL trong file .env"
      : null;

  if (firebaseConfigLoading) {
    return <CircularProgressCenter />;
  }

  if (configError) {
    return (
      <CenteredView>
        <div style={{ padding: 24, maxWidth: 760 }}>
          <h2>Lỗi cấu hình Firebase</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {String(configError)}
          </pre>
        </div>
      </CenteredView>
    );
  }

  if (r2ConfigError) {
    return (
      <CenteredView>
        <div style={{ padding: 24, maxWidth: 760 }}>
          <h2>Lỗi cấu hình Cloudflare R2</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {r2ConfigError}
          </pre>
        </div>
      </CenteredView>
    );
  }

  if (!firebaseApp) {
    return (
      <CenteredView>
        <div style={{ padding: 24 }}>Không thể khởi tạo Firebase.</div>
      </CenteredView>
    );
  }

  return (
    <FireCMSi18nProvider>
      <SnackbarProvider>
        <ModeControllerProvider value={modeController}>
          <FireCMS
            navigationController={navigationController}
            authController={authController}
            userConfigPersistence={userConfigPersistence}
            dataSourceDelegate={firestoreDelegate}
            storageSource={storageSource}
          >
            {({ loading }) => {
              if (loading || authLoading) {
                return <CircularProgressCenter size="large" />;
              }

              if (!canAccessMainView) {
                return (
                  <FirebaseLoginView
                    authController={authController}
                    firebaseApp={firebaseApp}
                    signInOptions={signInOptions}
                    notAllowedError={notAllowedError}
                  />
                );
              }

              return (
                <Scaffold autoOpenDrawer={false}>
                  <AppBar title="Quản trị Web" />
                  <Drawer />
                  <NavigationRoutes />
                  <SideDialogs />
                  <DatabaseSeeder />
                </Scaffold>
              );
            }}
          </FireCMS>
        </ModeControllerProvider>
      </SnackbarProvider>
    </FireCMSi18nProvider>
  );
}

export default App;
