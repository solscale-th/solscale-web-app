export type PaymentAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: "influencer" | "entrepreneur";
  countryCode: string;
  phone: string;
  paymentAccount: PaymentAccount;
};
