export const FEEDBACK_KEYS = ["storyboard", "voiceOver", "super", "other"] as const;

export type FeedbackKey = (typeof FEEDBACK_KEYS)[number];

export type WorkFeedbackItem = {
  key: FeedbackKey;
  score: number;
  comment: string;
};

export type WorkFeedback = {
  items: WorkFeedbackItem[];
  overall: string;
};

const KEY_SET = new Set<string>(FEEDBACK_KEYS);

export function encodeWorkFeedback(feedback: WorkFeedback): string {
  return JSON.stringify(feedback);
}

export function parseWorkFeedback(note: string): WorkFeedback | null {
  try {
    const value = JSON.parse(note) as Partial<WorkFeedback>;
    if (!value || !Array.isArray(value.items)) return null;
    const items = value.items.flatMap((item) => {
      if (!item || !KEY_SET.has(item.key) || typeof item.score !== "number") return [];
      return [
        {
          key: item.key as FeedbackKey,
          score: item.score,
          comment: typeof item.comment === "string" ? item.comment : "",
        },
      ];
    });
    return {
      items,
      overall: typeof value.overall === "string" ? value.overall : "",
    };
  } catch {
    return null;
  }
}
