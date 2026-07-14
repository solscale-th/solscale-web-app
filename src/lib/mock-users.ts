export type PaymentAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "influencer" | "entrepreneur";
  countryCode: string;
  phone: string;
  paymentAccount: PaymentAccount;
};

export const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "influ1",
    email: "toppst128@gmail.com",
    password: "Password123",
    role: "influencer",
    countryCode: "+66",
    phone: "0625486951",
    paymentAccount: {
      bankName: "Kasikorn Bank (KBank)",
      accountNumber: "062-5-48695-1",
      accountHolder: "Influ One",
    },
  },
  {
    id: "2",
    name: "entre1",
    email: "toppst128@gmail.com",
    password: "Password123",
    role: "entrepreneur",
    countryCode: "+66",
    phone: "0625486951",
    paymentAccount: {
      bankName: "Bangkok Bank (BBL)",
      accountNumber: "062-5-48695-2",
      accountHolder: "Entre One",
    },
  },
];

export function findUserByCredentials(
  email: string,
  password: string
): MockUser | null {
  return (
    MOCK_USERS.find((u) => u.email === email && u.password === password) ?? null
  );
}
