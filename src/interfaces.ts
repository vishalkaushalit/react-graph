export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface MonthlyFinance {
  month: string;
  salary: number;
  expenses: { name: string; amount: number }[];
}
