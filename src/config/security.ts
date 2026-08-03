const getBoundedInteger = (name: string, defaultValue: number, min: number, max: number) => {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value >= min && value <= max ? value : defaultValue;
};

export const securityConfig = {
  // Short-lived JWTs limit the impact of a stolen token.  The backend is the
  // authority: the frontend timer is only a usability aid.
  sessionDurationMinutes: getBoundedInteger("SESSION_DURATION_MINUTES", 120, 15, 1440),
  guestSessionDurationMinutes: getBoundedInteger("GUEST_SESSION_DURATION_MINUTES", 240, 15, 1440),
  captchaRequired: process.env.CAPTCHA_REQUIRED === "true",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
};
