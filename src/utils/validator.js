export function validateRegistrationForm(formData) {
  const {companyName, primaryAdmin, address} = formData;
  const errors = [];

  // Required field checks
  if (!companyName.trim()) errors.push("Company name is required.");
  if (!primaryAdmin.name.trim()) errors.push("Admin name is required.");
  if (!primaryAdmin.email) errors.push("Admin email is required.");
  if (!primaryAdmin.phone) errors.push("Phone number is required.");
  if (!primaryAdmin.password) errors.push("Password is required.");
  if (!address.street.trim()) errors.push("Street is required.");
  if (!address.city.trim()) errors.push("City is required.");
  if (!address.state.trim()) errors.push("State is required.");
  if (!address.zipCode.trim()) errors.push("Zip code is required.");

  // Email validation
  if (primaryAdmin.email && !validateEmail(primaryAdmin.email)) {
    errors.push("Invalid email format.");
  }

  // Phone validation
  if (primaryAdmin.phone && !validatePhoneNumber(primaryAdmin.phone)) {
    errors.push(
      "Invalid phone number. Enter a 10-digit number starting with 6-9."
    );
  }

  // Password validation
  if (primaryAdmin.password) {
    const passwordErrors = validatePassword(primaryAdmin.password);
    if (passwordErrors.length > 0) {
      errors.push(`Password must contain ${passwordErrors.join(", ")}.`);
    }
  }

  return errors;
}

export function validateLoginForm({email, password}) {
  const errors = {};

  if (!email || email.trim() === "") {
    errors.email = "Email is required";
  } else if (!validateEmail(email)) {
    errors.email = "Invalid email format";
  }

  if (!password || password.trim() === "") {
    errors.password = "Password is required";
  }

  return errors;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  const errors = [];

  if (password.length < 6) errors.push("at least 6 characters");
  if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
  if (!/\d/.test(password)) errors.push("a number");
  if (!/[@$!%*?&]/.test(password)) errors.push("a special character");

  return errors;
}

export function validatePhoneNumber(phone) {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}
