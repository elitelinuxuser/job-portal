// Job type constants for the platform
export const JOB_TYPES = {
  CANDID_PHOTOGRAPHER: "candid_photographer",
  CINEMATOGRAPHER: "cinematographer",
  TRADITIONAL_PHOTOGRAPHER: "traditional_photographer",
  TRADITIONAL_VIDEOGRAPHER: "traditional_videographer",
  PHOTO_EDITOR: "photo_editor",
  VIDEO_EDITOR: "video_editor",
  DRONE: "drone",
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

// User-friendly labels for display
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JOB_TYPES.CANDID_PHOTOGRAPHER]: "Candid Photographer",
  [JOB_TYPES.CINEMATOGRAPHER]: "Cinematographer",
  [JOB_TYPES.TRADITIONAL_PHOTOGRAPHER]: "Traditional Photographer",
  [JOB_TYPES.TRADITIONAL_VIDEOGRAPHER]: "Traditional Videographer",
  [JOB_TYPES.PHOTO_EDITOR]: "Photo Editor",
  [JOB_TYPES.VIDEO_EDITOR]: "Video Editor",
  [JOB_TYPES.DRONE]: "Drone Operator",
};

// Array of all job types for dropdowns/selects
export const JOB_TYPE_OPTIONS = Object.entries(JOB_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

// Helper function to get label from value
export function getJobTypeLabel(value: JobType): string {
  return JOB_TYPE_LABELS[value] || value;
}

// Helper function to check if a value is a valid job type
export function isValidJobType(value: string): value is JobType {
  return Object.values(JOB_TYPES).includes(value as JobType);
}
