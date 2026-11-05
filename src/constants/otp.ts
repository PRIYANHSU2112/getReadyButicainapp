// Service Start / End OTPs (the code the customer reads out to the partner).
// The booking API validates 4-6 digits. Both screens show the maximum number of boxes so a
// longer code is never typed invisibly, and accept anything from the minimum up, so a
// shorter code still works. Change these two numbers if the API's rule changes.
// The login OTP is separate: the auth API requires exactly 6 (see OTPScreen).
export const SERVICE_OTP_MIN_LENGTH = 4;
export const SERVICE_OTP_MAX_LENGTH = 6;
