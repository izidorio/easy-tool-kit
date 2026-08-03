export type AppUpdateCheckResult = {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  downloadUrl: string;
  /** Preenchido quando a checagem falhou (rede, GitHub, etc.). */
  error?: string;
};

export type AppUpdateProgress = {
  percent: number;
  message: string;
};
