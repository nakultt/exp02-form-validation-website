// ===== Client-side form validation for the registration form =====

const form = document.getElementById("registerForm");
const successBox = document.getElementById("successBox");

// Regular expressions used for format checks
const patterns = {
  name: /^[A-Za-z][A-Za-z .]{2,49}$/,
  email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
  phone: /^[6-9]\d{9}$/,            // Indian mobile numbers
  pincode: /^[1-9]\d{5}$/,          // Indian PIN codes
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
};

function showError(input, message) {
  const errorEl = document.getElementById(input.id + "Error");
  errorEl.textContent = message;
  input.classList.add("invalid");
  input.classList.remove("valid");
  return false;
}

function showSuccess(input) {
  document.getElementById(input.id + "Error").textContent = "";
  input.classList.remove("invalid");
  input.classList.add("valid");
  return true;
}

// One validator per field: returns true when the value is valid
const validators = {
  fullName(input) {
    const v = input.value.trim();
    if (v === "") return showError(input, "Full name is required");
    if (!patterns.name.test(v)) return showError(input, "Use 3-50 letters, spaces or dots only");
    return showSuccess(input);
  },
  dob(input) {
    if (input.value === "") return showError(input, "Date of birth is required");
    const age = (Date.now() - new Date(input.value)) / (365.25 * 24 * 3600 * 1000);
    if (age < 16) return showError(input, "You must be at least 16 years old");
    return showSuccess(input);
  },
  email(input) {
    const v = input.value.trim();
    if (v === "") return showError(input, "Email ID is required");
    if (!patterns.email.test(v)) return showError(input, "Enter a valid email (e.g. name@example.com)");
    return showSuccess(input);
  },
  phone(input) {
    const v = input.value.trim();
    if (v === "") return showError(input, "Phone number is required");
    if (!patterns.phone.test(v)) return showError(input, "Enter a valid 10-digit mobile number starting with 6-9");
    return showSuccess(input);
  },
  address(input) {
    const v = input.value.trim();
    if (v === "") return showError(input, "Address is required");
    if (v.length < 10) return showError(input, "Address must be at least 10 characters");
    return showSuccess(input);
  },
  city(input) {
    const v = input.value.trim();
    if (v === "") return showError(input, "City is required");
    if (!/^[A-Za-z ]{2,}$/.test(v)) return showError(input, "City should contain letters only");
    return showSuccess(input);
  },
  pincode(input) {
    const v = input.value.trim();
    if (v === "") return showError(input, "PIN code is required");
    if (!patterns.pincode.test(v)) return showError(input, "PIN code must be exactly 6 digits and not start with 0");
    return showSuccess(input);
  },
  password(input) {
    const v = input.value;
    if (v === "") return showError(input, "Password is required");
    if (!patterns.password.test(v))
      return showError(input, "Min 8 chars with uppercase, lowercase, number and symbol");
    return showSuccess(input);
  },
  confirmPassword(input) {
    const v = input.value;
    if (v === "") return showError(input, "Please confirm your password");
    if (v !== document.getElementById("password").value) return showError(input, "Passwords do not match");
    return showSuccess(input);
  }
};

function validateGender() {
  const checked = document.querySelector('input[name="gender"]:checked');
  document.getElementById("genderError").textContent = checked ? "" : "Please select your gender";
  return Boolean(checked);
}

function validateTerms() {
  const ok = document.getElementById("terms").checked;
  document.getElementById("termsError").textContent = ok ? "" : "You must accept the terms to continue";
  return ok;
}

// Validate a field as soon as the user leaves it (blur) and re-check while typing once it was invalid
Object.keys(validators).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("blur", () => validators[id](input));
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid") || input.classList.contains("valid")) validators[id](input);
  });
});

// Allow only digits in numeric fields
["phone", "pincode"].forEach((id) => {
  document.getElementById(id).addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  });
});

document.querySelectorAll('input[name="gender"]').forEach((r) => r.addEventListener("change", validateGender));
document.getElementById("terms").addEventListener("change", validateTerms);

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop submission until every check passes

  let allValid = true;
  Object.keys(validators).forEach((id) => {
    if (!validators[id](document.getElementById(id))) allValid = false;
  });
  if (!validateGender()) allValid = false;
  if (!validateTerms()) allValid = false;

  if (!allValid) {
    successBox.classList.add("hidden");
    const firstInvalid = form.querySelector(".invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // All checks passed: show a summary of the submitted data
  const data = new FormData(form);
  const rows = [
    ["Full Name", data.get("fullName")],
    ["Date of Birth", data.get("dob")],
    ["Email ID", data.get("email")],
    ["Phone", data.get("phone")],
    ["Gender", data.get("gender")],
    ["City", data.get("city")],
    ["PIN Code", data.get("pincode")]
  ];
  successBox.innerHTML =
    "<h3>&#10004; Registration Successful</h3><table>" +
    rows.map(([k, v]) => `<tr><td>${k}</td><td>${String(v).replace(/</g, "&lt;")}</td></tr>`).join("") +
    "</table>";
  successBox.classList.remove("hidden");
});

form.addEventListener("reset", () => {
  form.querySelectorAll("input, textarea").forEach((el) => el.classList.remove("valid", "invalid"));
  form.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
  successBox.classList.add("hidden");
});
