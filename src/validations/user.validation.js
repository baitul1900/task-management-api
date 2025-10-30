import vine from '@vinejs/vine';

// Full name rules (summary):
// - optional
// - allow international letters + spaces + apostrophes + hyphens + periods
// - 1..100 chars (when provided)
const fullNameRegex = /^[\p{L}\p{M}\s'.-]{1,100}$/u;

// Username rules (summary):
// - lowercased (case-insensitive UX)
// - 3..30 chars
// - allowed: a-z, 0-9, underscore, hyphen
// - cannot start/end with _ or -
// - cannot have double separators like __ or -- or _- or -_
// - forbid '@' so it can’t look like an email
const usernameAllowedRegex = /^[a-z0-9_-]+$/;
const usernameBoundariesRegex = /^(?![_-])[a-z0-9_-]{3,30}(?<![_-])$/;  // no leading/trailing _-
const usernameNoDoubleSepRegex = /^(?!.*[_-]{2}).*$/;                   // no consecutive _ or -
const usernameNoAtRegex = /^(?!.*@).*$/;    


const userRegistrationValidationSchema = vine.object({
     fullName: vine.string()
      .trim()
      .maxLength(100)
      .regex(fullNameRegex, 'Full name may include letters, spaces, apostrophes, hyphens, and periods')
      .optional(),
    userName: vine.string()
        .regex(usernameAllowedRegex, "Username can only contain lowercase letters, numbers, underscores, and hyphens.")
        .regex(usernameBoundariesRegex, "Username must be 3 to 30 characters long.")
        .regex(usernameNoDoubleSepRegex, "Username cannot have consecutive underscores or hyphens.")
        .regex(usernameNoAtRegex, "Username cannot contain the @ symbol.")
        .toLowerCase(),
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(100),
    gender: vine.enum(["male", "female", "other"])
});

const userRegistrationValidation = vine.compile(userRegistrationValidationSchema);

export  { userRegistrationValidation  };