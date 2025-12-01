export type Preferences = {
  role?: "customer" | "vendor" | "admin" | string;
  onboardingComplete?: boolean;
  onboardingStep?: string | null;
  // add other small prefs you want persisted
  [key: string]: any;
};
