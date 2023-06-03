export interface SignUpPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  interests: string;
}

export type LoginPayload = Pick<SignUpPayload, "email" | "password">;
