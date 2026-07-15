import { graphqlRequest } from "./api";
import type { MockUser } from "./mock-users";

type ApiInfluencerAccount = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  stageName?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
};

type ApiEntrepreneurAccount = {
  id: number;
  email: string;
  companyName?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
};

type LoginResult = { token: string; user: MockUser };

const LOGIN_INFLUENCER = /* GraphQL */ `
  mutation LoginInfluencer($input: LoginInfluencerInput!) {
    loginInfluencer(input: $input) {
      data {
        token
        influencer {
          id
          email
          firstName
          lastName
          stageName
          bankName
          bankAccountName
          bankAccountNumber
        }
      }
      status {
        error
      }
    }
  }
`;

const LOGIN_ENTREPRENEUR = /* GraphQL */ `
  mutation LoginEntrepreneur($input: LoginEntrepreneurInput!) {
    loginEntrepreneur(input: $input) {
      data {
        token
        entrepreneur {
          id
          email
          companyName
          bankName
          bankAccountName
          bankAccountNumber
        }
      }
      status {
        error
      }
    }
  }
`;

type LoginInfluencerResponse = {
  loginInfluencer: {
    data: { token: string; influencer: ApiInfluencerAccount } | null;
    status?: { error?: string | null };
  };
};

type LoginEntrepreneurResponse = {
  loginEntrepreneur: {
    data: { token: string; entrepreneur: ApiEntrepreneurAccount } | null;
    status?: { error?: string | null };
  };
};

// ── Create mutations ─────────────────────────────────────────────────────────

const CREATE_INFLUENCER = /* GraphQL */ `
  mutation CreateInfluencer($input: CreateInfluencerInput!) {
    createInfluencer(input: $input) {
      data {
        id
        email
        firstName
        lastName
        stageName
        bankName
        bankAccountName
        bankAccountNumber
      }
      status {
        error
      }
    }
  }
`;

const CREATE_ENTREPRENEUR = /* GraphQL */ `
  mutation CreateEntrepreneur($input: CreateEntrepreneurInput!) {
    createEntrepreneur(input: $input) {
      data {
        id
        email
        companyName
        bankName
        bankAccountName
        bankAccountNumber
      }
      status {
        error
      }
    }
  }
`;

type CreateInfluencerResponse = {
  createInfluencer: {
    data: ApiInfluencerAccount | null;
    status?: { error?: string | null };
  };
};

type CreateEntrepreneurResponse = {
  createEntrepreneur: {
    data: ApiEntrepreneurAccount | null;
    status?: { error?: string | null };
  };
};

export type CreateInfluencerInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type CreateEntrepreneurInput = {
  email: string;
  password: string;
  companyName: string;
};

export async function signupInfluencer(
  input: CreateInfluencerInput
): Promise<void> {
  const res = await graphqlRequest<CreateInfluencerResponse>(
    CREATE_INFLUENCER,
    { input }
  );
  const { data, status } = res.createInfluencer;
  if (!data) throw new Error(status?.error ?? "Sign up failed");
}

export async function signupEntrepreneur(
  input: CreateEntrepreneurInput
): Promise<void> {
  const res = await graphqlRequest<CreateEntrepreneurResponse>(
    CREATE_ENTREPRENEUR,
    { input }
  );
  const { data, status } = res.createEntrepreneur;
  if (!data) throw new Error(status?.error ?? "Sign up failed");
}

// ── Login mutations ──────────────────────────────────────────────────────────

export async function loginInfluencer(
  email: string,
  password: string
): Promise<LoginResult> {
  const res = await graphqlRequest<LoginInfluencerResponse>(LOGIN_INFLUENCER, {
    input: { email, password },
  });

  const { data, status } = res.loginInfluencer;
  if (!data) throw new Error(status?.error ?? "Login failed");

  const { token, influencer } = data;
  const name =
    influencer.stageName?.trim() ||
    `${influencer.firstName ?? ""} ${influencer.lastName ?? ""}`.trim() ||
    influencer.email;

  const user: MockUser = {
    id: String(influencer.id),
    name,
    email: influencer.email,
    password,
    role: "influencer",
    countryCode: "+66",
    phone: "",
    paymentAccount: {
      bankName: influencer.bankName ?? "",
      accountNumber: influencer.bankAccountNumber ?? "",
      accountHolder: influencer.bankAccountName ?? "",
    },
  };

  return { token, user };
}

export async function loginEntrepreneur(
  email: string,
  password: string
): Promise<LoginResult> {
  const res = await graphqlRequest<LoginEntrepreneurResponse>(
    LOGIN_ENTREPRENEUR,
    { input: { email, password } }
  );

  const { data, status } = res.loginEntrepreneur;
  if (!data) throw new Error(status?.error ?? "Login failed");

  const { token, entrepreneur } = data;

  const user: MockUser = {
    id: String(entrepreneur.id),
    name: entrepreneur.companyName?.trim() || entrepreneur.email,
    email: entrepreneur.email,
    password,
    role: "entrepreneur",
    countryCode: "+66",
    phone: "",
    paymentAccount: {
      bankName: entrepreneur.bankName ?? "",
      accountNumber: entrepreneur.bankAccountNumber ?? "",
      accountHolder: entrepreneur.bankAccountName ?? "",
    },
  };

  return { token, user };
}
