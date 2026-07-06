const ARGENTINE_PLATE = /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2}|[A-Z]\d{3}[A-Z]{3}|\d{3}[A-Z]{3})$/;
const VEHICLE_BRAND = /^[\p{L}\d][\p{L}\d .&'/-]{1,49}$/u;

export const normalizeLicensePlate = (value: string) => value.replace(/[\s-]/g, "").toUpperCase();

export const validateLicensePlate = (value: string) => {
  const normalized = normalizeLicensePlate(value);
  if (!ARGENTINE_PLATE.test(normalized)) throw new Error("Formato de patente inválido (ej: AAA123 o AA123BB)");
  return normalized;
};

export const validatePhone = (value: string) => {
  if (!value.trim()) return;
  if (!/^\+?[0-9\s()-]+$/.test(value)) throw new Error("El teléfono contiene caracteres inválidos");
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("54")) digits = digits.slice(2);
  if (digits.startsWith("9") && digits.length === 11) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = digits.slice(1);
  const candidates = [digits];
  if (digits.length === 12) {
    for (const areaLength of [2, 3, 4]) {
      if (digits.slice(areaLength, areaLength + 2) === "15") candidates.push(digits.slice(0, areaLength) + digits.slice(areaLength + 2));
    }
  }
  if (!candidates.some((number) => number.length === 10 && /^(?:11|[23]\d{1,3})\d{6,8}$/.test(number))) {
    throw new Error("Ingresá un teléfono argentino válido: código de área y número (10 dígitos)");
  }
};

export const validateVehicleBrand = (value: string) => {
  if (!value.trim()) return;
  if (!VEHICLE_BRAND.test(value.trim())) throw new Error("La marca del vehículo contiene caracteres inválidos");
};

export const getErrorMessage = (reason: unknown, fallback: string) =>
  reason instanceof Error ? reason.message : fallback;
