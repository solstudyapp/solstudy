export const FEATURES = {
  SOCIAL_AUTH: false, // Set to true when social auth is ready
} as const

export type FeatureFlag = keyof typeof FEATURES 