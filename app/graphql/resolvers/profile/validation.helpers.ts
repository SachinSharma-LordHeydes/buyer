import { AddressType } from '@prisma/client';

// Types for validation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Core validation functions
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
  const cleanPhone = phone.replace(/[()\\s-]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
};

export const validatePanNumber = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequiredString = (value: string, fieldName: string): ValidationError | null => {
  if (!value || !value.trim()) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD_MISSING'
    };
  }
  return null;
};

// Specific validation functions
export const validatePersonalDetails = (personalDetails: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  const firstNameError = validateRequiredString(personalDetails.firstName, 'firstName');
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = validateRequiredString(personalDetails.lastName, 'lastName');
  if (lastNameError) errors.push(lastNameError);

  // Optional phone number validation
  if (personalDetails.phoneNumber && !validatePhoneNumber(personalDetails.phoneNumber)) {
    errors.push({
      field: 'phoneNumber',
      message: 'Invalid phone number format. Please enter a valid international phone number.',
      code: 'INVALID_PHONE_FORMAT'
    });
  }

  return errors;
};

export const validateAddress = (address: any, addressType: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  const prefix = addressType.toLowerCase();

  // Required fields
  const requiredFields = ['province', 'city', 'pinCode', 'locality'];
  requiredFields.forEach(field => {
    const error = validateRequiredString(address[field], `${prefix}.${field}`);
    if (error) errors.push(error);
  });

  // Pincode validation
  if (address.pinCode && !validatePincode(address.pinCode)) {
    errors.push({
      field: `${prefix}.pinCode`,
      message: `Invalid ${addressType} address pincode format. Must be 6 digits starting with 1-9.`,
      code: 'INVALID_PINCODE_FORMAT'
    });
  }

  // Address type validation
  if (!Object.values(AddressType).includes(address.addressType)) {
    errors.push({
      field: `${prefix}.addressType`,
      message: `Invalid address type. Must be one of: ${Object.values(AddressType).join(', ')}`,
      code: 'INVALID_ADDRESS_TYPE'
    });
  }

  return errors;
};

export const validateStoreDetails = (storeDetails: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  const storeNameError = validateRequiredString(storeDetails.storeName, 'storeName');
  if (storeNameError) errors.push(storeNameError);

  const storeTypeError = validateRequiredString(storeDetails.storeType, 'storeType');
  if (storeTypeError) errors.push(storeTypeError);

  // Store name length validation
  if (storeDetails.storeName && storeDetails.storeName.trim().length < 3) {
    errors.push({
      field: 'storeName',
      message: 'Store name must be at least 3 characters long',
      code: 'STORE_NAME_TOO_SHORT'
    });
  }

  return errors;
};

export const validateDocumentation = (documentation: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required PAN number
  const panError = validateRequiredString(documentation.panNumber, 'panNumber');
  if (panError) errors.push(panError);

  // PAN format validation
  if (documentation.panNumber && !validatePanNumber(documentation.panNumber)) {
    errors.push({
      field: 'panNumber',
      message: 'Invalid PAN number format. Format should be: ABCDE1234F',
      code: 'INVALID_PAN_FORMAT'
    });
  }

  return errors;
};

// Main validation function for profile setup
export const validateProfileSetupInput = (input: any): ValidationResult => {
  const errors: ValidationError[] = [];

  try {
    // Validate personal details
    if (input.personalDetails) {
      errors.push(...validatePersonalDetails(input.personalDetails));
    } else {
      errors.push({
        field: 'personalDetails',
        message: 'Personal details are required',
        code: 'REQUIRED_SECTION_MISSING'
      });
    }

    // Validate addresses (legacy format)
    if (input.permanentAddress) {
      errors.push(...validateAddress(input.permanentAddress, 'permanentAddress'));
    }
    if (input.temporaryAddress) {
      errors.push(...validateAddress(input.temporaryAddress, 'temporaryAddress'));
    }
    if (input.storeAddress) {
      errors.push(...validateAddress(input.storeAddress, 'storeAddress'));
    }

    // Validate addresses (new format)
    if (input.addresses && Array.isArray(input.addresses)) {
      input.addresses.forEach((address: any, index: number) => {
        const addressErrors = validateAddress(address, `addresses[${index}]`);
        errors.push(...addressErrors);
      });

      // Ensure required address types are present
      const addressTypes = input.addresses.map((addr: any) => addr.addressType);
      const requiredTypes = [AddressType.PERMANENT, AddressType.TEMPORARY, AddressType.STORE];
      
      requiredTypes.forEach(type => {
        if (!addressTypes.includes(type)) {
          errors.push({
            field: 'addresses',
            message: `${type} address is required`,
            code: 'REQUIRED_ADDRESS_TYPE_MISSING'
          });
        }
      });
    }

    // Validate store details
    if (input.storeDetails) {
      errors.push(...validateStoreDetails(input.storeDetails));
    } else {
      errors.push({
        field: 'storeDetails',
        message: 'Store details are required',
        code: 'REQUIRED_SECTION_MISSING'
      });
    }

    // Validate documentation
    if (input.documentation) {
      errors.push(...validateDocumentation(input.documentation));
    } else {
      errors.push({
        field: 'documentation',
        message: 'Documentation is required',
        code: 'REQUIRED_SECTION_MISSING'
      });
    }

  } catch (error) {
    errors.push({
      field: 'general',
      message: 'Validation error occurred',
      code: 'VALIDATION_ERROR'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Calculate profile completion percentage
export const calculateProfileCompletion = (profile: any): number => {
  const sections = [
    { name: 'personalDetails', weight: 25, fields: ['firstName', 'lastName'] },
    { name: 'addresses', weight: 25, required: 3 }, // permanent, temporary, store
    { name: 'storeDetails', weight: 25, fields: ['storeName', 'storeType'] },
    { name: 'documentation', weight: 25, fields: ['panNumber'] }
  ];

  let totalScore = 0;

  sections.forEach(section => {
    if (section.fields) {
      // Field-based completion
      const completedFields = section.fields.filter(field => {
        if (section.name === 'personalDetails' && profile.firstName && profile.lastName) {
          return true;
        }
        return false;
      }).length;
      
      totalScore += (completedFields / section.fields.length) * section.weight;
    } else if (section.required) {
      // Count-based completion (addresses)
      const addressCount = profile.addresses?.length || 0;
      const completionRatio = Math.min(addressCount / section.required, 1);
      totalScore += completionRatio * section.weight;
    }
  });

  return Math.round(totalScore);
};

// Helper to sanitize input data
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    Object.keys(input).forEach(key => {
      sanitized[key] = sanitizeInput(input[key]);
    });
    return sanitized;
  }
  
  return input;
};
