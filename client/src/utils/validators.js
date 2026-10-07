export const EMAIL_REGEX = /^\S+@\S+\.\S{2,}$/;
export const PHONE_REGEX = /^(\+?\d{1,3}[- ]?)?\d{7,15}$/;

export const validateRegister = (values) => {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Name is required';
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Please enter a valid email';

  if (!values.phone?.trim()) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(values.phone.trim()))
    errors.phone = 'Please enter a valid phone number (7-15 digits)';

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6)
    errors.password = 'Password must be at least 6 characters';
  else if (!/\d/.test(values.password))
    errors.password = 'Password must contain at least one number';

  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Passwords do not match';

  return errors;
};

export const validateLogin = (values) => {
  const errors = {};

  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Please enter a valid email';

  if (!values.password) errors.password = 'Password is required';

  return errors;
};

export const validateProfile = (values) => {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Name is required';
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!values.phone?.trim()) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(values.phone.trim()))
    errors.phone = 'Please enter a valid phone number (7-15 digits)';

  return errors;
};

export const validateMembership = (values) => {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Membership name is required';
  else if (values.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';

  if (!values.description?.trim()) errors.description = 'Description is required';
  else if (values.description.trim().length < 10)
    errors.description = 'Description must be at least 10 characters';

  if (values.price === '' || values.price === null || values.price === undefined)
    errors.price = 'Price is required';
  else if (Number.isNaN(Number(values.price))) errors.price = 'Price must be a number';
  else if (Number(values.price) < 0) errors.price = 'Price cannot be negative';

  if (values.duration === '' || values.duration === null || values.duration === undefined)
    errors.duration = 'Duration is required';
  else if (Number.isNaN(Number(values.duration)) || Number(values.duration) < 1)
    errors.duration = 'Duration must be greater than 0';

  if (!values.category?.trim()) errors.category = 'Category is required';

  return errors;
};

export const validateChangePassword = (values) => {
  const errors = {};

  if (!values.currentPassword) errors.currentPassword = 'Current password is required';
  if (!values.newPassword) errors.newPassword = 'New password is required';
  else if (values.newPassword.length < 6)
    errors.newPassword = 'New password must be at least 6 characters';
  else if (!/\d/.test(values.newPassword))
    errors.newPassword = 'New password must contain at least one number';

  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
  else if (values.confirmPassword !== values.newPassword)
    errors.confirmPassword = 'Passwords do not match';

  return errors;
};
