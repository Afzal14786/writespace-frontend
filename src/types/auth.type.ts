export interface RegisterPayload {
  fullname: string;
  username: string;
  email: string;
  password?: string;
}

export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  profileImageUrl?: string;
  role: string;
  status: string;
}