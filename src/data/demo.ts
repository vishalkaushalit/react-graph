export const demoCredentials = {
  email: "demo@example.com",
  password: "Demo@123",
};

export const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
