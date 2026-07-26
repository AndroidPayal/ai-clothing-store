export type User = {
  id: string;
  fullName: string;
  email: string;
  password?: string;
};

export const users: User[] = [
  {
    id:"1",
    fullName: "Payal",
    email: "payal@gmail.com",
    password:"1234"
  }
]