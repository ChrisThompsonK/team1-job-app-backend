/**
 * Interface for incoming profile update request data
 */
export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  currentPassword?: string;
  newPassword?: string;
}

/**
 * Interface for validated profile update data
 */
export interface ValidatedProfileUpdate {
  basicFields: {
    name?: string;
    phoneNumber?: string | null;
    address?: string | null;
  };
  emailUpdate?: {
    newEmail: string;
    currentPassword: string;
  };
  passwordUpdate?: {
    currentPassword: string;
    newPassword: string;
  };
}

/**
 * ProfileValidator class provides comprehensive validation for profile update data
 */
export class ProfileValidator {
  /**
   * Validates and processes a complete profile update request
   * @param data - The profile update request data
   * @returns Validated and structured update data
   * @throws Error if validation fails
   */
  validateProfileUpdate(data: ProfileUpdateRequest): ValidatedProfileUpdate {
    if (!data || typeof data !== "object") {
      throw new Error("Profile update data is required");
    }

    const result: ValidatedProfileUpdate = {
      basicFields: {},
    };

    // Check if any valid fields are provided
    const hasBasicFields =
      data.name !== undefined ||
      data.phoneNumber !== undefined ||
      data.address !== undefined;
    const hasEmailUpdate = data.email !== undefined;
    const hasPasswordUpdate = data.newPassword !== undefined;

    if (!hasBasicFields && !hasEmailUpdate && !hasPasswordUpdate) {
      throw new Error("At least one field must be provided for update");
    }

    // Validate basic profile fields
    if (hasBasicFields) {
      this.validateBasicFields(data, result.basicFields);
    }

    // Validate email update
    if (hasEmailUpdate) {
      result.emailUpdate = this.validateEmailUpdate(data);
    }

    // Validate password update
    if (hasPasswordUpdate) {
      result.passwordUpdate = this.validatePasswordUpdate(data);
    }

    return result;
  }

  /**
   * Validates basic profile fields (name, phone, address)
   * @param data - The input data
   * @param basicFields - The object to populate with validated basic fields
   * @throws Error if validation fails
   */
  private validateBasicFields(
    data: ProfileUpdateRequest,
    basicFields: ValidatedProfileUpdate["basicFields"]
  ): void {
    // Validate name
    if (data.name !== undefined) {
      if (data.name === null || data.name === "") {
        throw new Error("Name cannot be empty");
      }
      if (typeof data.name !== "string") {
        throw new Error("Name must be a string");
      }
      const trimmedName = data.name.trim();
      if (trimmedName.length === 0) {
        throw new Error("Name cannot be empty");
      }
      if (trimmedName.length > 100) {
        throw new Error("Name cannot exceed 100 characters");
      }
      basicFields.name = trimmedName;
    }

    // Validate phone number
    if (data.phoneNumber !== undefined) {
      if (data.phoneNumber === null || data.phoneNumber === "") {
        // Allow clearing the phone number
        basicFields.phoneNumber = null;
      } else {
        if (typeof data.phoneNumber !== "string") {
          throw new Error("Phone number must be a string");
        }
        const trimmedPhone = data.phoneNumber.trim();
        if (trimmedPhone.length === 0) {
          basicFields.phoneNumber = null;
        } else {
          this.validatePhoneNumber(trimmedPhone);
          basicFields.phoneNumber = trimmedPhone;
        }
      }
    }

    // Validate address
    if (data.address !== undefined) {
      if (data.address === null || data.address === "") {
        // Allow clearing the address
        basicFields.address = null;
      } else {
        if (typeof data.address !== "string") {
          throw new Error("Address must be a string");
        }
        const trimmedAddress = data.address.trim();
        if (trimmedAddress.length === 0) {
          basicFields.address = null;
        } else {
          if (trimmedAddress.length > 500) {
            throw new Error("Address cannot exceed 500 characters");
          }
          basicFields.address = trimmedAddress;
        }
      }
    }
  }

  /**
   * Validates email update request
   * @param data - The input data
   * @returns Validated email update data
   * @throws Error if validation fails
   */
  private validateEmailUpdate(data: ProfileUpdateRequest): {
    newEmail: string;
    currentPassword: string;
  } {
    if (!data.email || typeof data.email !== "string") {
      throw new Error("New email is required for email update");
    }

    if (!data.currentPassword || typeof data.currentPassword !== "string") {
      throw new Error("Current password is required for email update");
    }

    const trimmedEmail = data.email.trim();
    if (trimmedEmail.length === 0) {
      throw new Error("Email cannot be empty");
    }

    this.validateEmailFormat(trimmedEmail);

    return {
      newEmail: trimmedEmail,
      currentPassword: data.currentPassword,
    };
  }

  /**
   * Validates password update request
   * @param data - The input data
   * @returns Validated password update data
   * @throws Error if validation fails
   */
  private validatePasswordUpdate(data: ProfileUpdateRequest): {
    currentPassword: string;
    newPassword: string;
  } {
    if (!data.currentPassword || typeof data.currentPassword !== "string") {
      throw new Error("Current password is required for password update");
    }

    if (!data.newPassword || typeof data.newPassword !== "string") {
      throw new Error("New password is required");
    }

    this.validatePasswordStrength(data.newPassword);

    return {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };
  }

  /**
   * Validates email format using regex
   * @param email - The email to validate
   * @throws Error if email format is invalid
   */
  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    if (email.length > 254) {
      throw new Error("Email address is too long");
    }
  }

  /**
   * Validates phone number format
   * @param phoneNumber - The phone number to validate
   * @throws Error if phone number format is invalid
   */
  private validatePhoneNumber(phoneNumber: string): void {
    // Allow various phone number formats
    // Remove common formatting characters for validation
    const cleanPhone = phoneNumber.replace(/[\s\-()+]/g, "");

    // Check if it contains only digits after cleaning
    if (!/^\d+$/.test(cleanPhone)) {
      throw new Error(
        "Phone number can only contain digits, spaces, dashes, parentheses, and plus sign"
      );
    }

    // Check length (international numbers can be 7-15 digits)
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      throw new Error("Phone number must be between 7 and 15 digits");
    }
  }

  /**
   * Validates password strength
   * @param password - The password to validate
   * @throws Error if password doesn't meet requirements
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      throw new Error("Password cannot exceed 128 characters");
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      throw new Error(
        "Password must contain at least one letter and one number"
      );
    }
  }
}
