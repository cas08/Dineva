export type SignUpFormData = {
  name: string;
  surname?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  passwordRepeat: string;
};

export type SignInFormData = {
  email: string;
  password: string;
};
