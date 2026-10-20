/**
 * REGISTRATION CODE TYPES
 * 
 * Defines the shape of data from backend
 * Think of it as: "What does a registration code look like?"
 */

export interface RegistrationCode {
  id: number;
  organization_id: number;
  code: string;                    // Example: "COOP-001-2026-A1B2C3D4"
  is_used: boolean;                // ✅ Has a farmer used this yet?
  used_by_user_id: number | null;  // ✅ Which farmer used it? (null if not used)
  created_at: string;              // "2026-02-15T..."
  role: string;                    // "farmer" or other role
  is_active: boolean;              // Is this code still valid?
}

export interface GenerateCodesRequest {
  count: number;  // How many codes to generate?
}

export interface VerifyCodeRequest {
  code: string;
}

export interface CodeVerificationResponse {
  valid: boolean;
  organization_id?: number;
  message?: string;
}

export interface UseRegistrationCodeReturn {
  // STATE
  codes: RegistrationCode[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  
  // FUNCTIONS
  loadCodes: () => Promise<void>;
  generateCodes: (count: number) => Promise<RegistrationCode[]>;
  deleteCode: (id: number) => Promise<void>;
  verififyCode: (code: string) => Promise<CodeVerificationResponse>;
  clearError: () => void;
}