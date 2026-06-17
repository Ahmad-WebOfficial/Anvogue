// API service for authentication endpoints

interface RegisterPayload {
  ClientRole: number;
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneCode: string;
  ISOCode: string;
  PhoneNumber: string;
  Password: string;
  ConfirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const registerUser = async (payload: RegisterPayload): Promise<ApiResponse> => {
  try {
    console.log("Payload being sent:", JSON.stringify(payload)); // 1. Ye check karein

    const response = await fetch(`${API_URL}/api/v1/Account/Register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-security-key': API_KEY || '',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Full Server Response:", data); // 2. Sabse important line (Yahan error detail hogi)

    if (!response.ok) {
      return {
        success: false,
        message: data.Message || data.message || 'Registration failed.',
        data,
      };
    }

    return {
      success: true,
      message: 'Registration successful!',
      data,
    };
  } catch (error) {
    console.error('Catch block error:', error); // 3. Network error yahan dikhega
    return {
      success: false,
      message: 'An error occurred during registration.',
    };
  }
};
