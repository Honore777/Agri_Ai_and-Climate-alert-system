const validateEmail = (email: string): boolean => {
  // Check if email looks like an email (has @ symbol, etc)
  return email.includes('@');
};

const validatePassword = (password: string): boolean => {
  // Check if password is long enough
  return password.length >= 6;
};

export { validateEmail, validatePassword };