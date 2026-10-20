export type PaymentAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export type ProfileProduct = {
  name: string;
  description: string;
};

export type ProfilePackage = {
  name: string;
  price: string;
  detail: string;
  platform: string;
  revisions?: number;
  turnaroundDays?: number;
};

export type ProfileAddon = {
  name: string;
  price: string;
};

/** Details a job needs from the person creating or receiving it. */
export type JobProfile = {
  companyName: string;
  location: string;
  brandDescription: string;
  languages: string[];
  products: ProfileProduct[];
  stageName: string;
  platforms: string[];
  categories: string[];
  packages: ProfilePackage[];
  addons: ProfileAddon[];
};

export function emptyJobProfile(): JobProfile {
  return {
    companyName: "",
    location: "",
    brandDescription: "",
    languages: [],
    products: [],
    stageName: "",
    platforms: [],
    categories: [],
    packages: [],
    addons: [],
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function parseJobProfile(value: unknown): JobProfile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const products = Array.isArray(raw.products)
    ? raw.products.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        return [{ name: asString(record.name), description: asString(record.description) }];
      })
    : [];
  const packages = Array.isArray(raw.packages)
    ? raw.packages.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        return [
          {
            name: asString(record.name),
            price: asString(record.price),
            detail: asString(record.detail),
            platform: asString(record.platform),
            ...(typeof record.revisions === "number" ? { revisions: record.revisions } : {}),
            ...(typeof record.turnaroundDays === "number"
              ? { turnaroundDays: record.turnaroundDays }
              : {}),
          },
        ];
      })
    : [];
  const addons = Array.isArray(raw.addons)
    ? raw.addons.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        return [{ name: asString(record.name), price: asString(record.price) }];
      })
    : [];

  return {
    ...emptyJobProfile(),
    companyName: asString(raw.companyName),
    location: asString(raw.location),
    brandDescription: asString(raw.brandDescription),
    languages: asStringList(raw.languages),
    products,
    stageName: asString(raw.stageName),
    platforms: asStringList(raw.platforms),
    categories: asStringList(raw.categories),
    packages,
    addons,
  };
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "influencer" | "entrepreneur";
  countryCode: string;
  phone: string;
  paymentAccount: PaymentAccount;
  jobProfile?: JobProfile;
};
