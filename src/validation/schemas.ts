import { z } from "zod";

const ARGENTINE_PLATE = /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2}|[A-Z]\d{3}[A-Z]{3}|\d{3}[A-Z]{3})$/;
const VEHICLE_BRAND = /^[\p{L}\d][\p{L}\d .&'/-]{1,49}$/u;

const isValidArgentinePhone = (value: string) => {
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
  return candidates.some((number) => number.length === 10 && /^(?:11|[23]\d{1,3})\d{6,8}$/.test(number));
};

export const licensePlateSchema = z.string().trim()
  .transform((value) => value.replace(/[\s-]/g, "").toUpperCase())
  .refine((value) => ARGENTINE_PLATE.test(value), {
    message: "Formato de patente inválido (ej: AAA123 o AA123BB)",
  });

const phoneValueSchema = z.string().trim().superRefine((value, ctx) => {
  if (!/^\+?[0-9\s()-]+$/.test(value)) {
    ctx.addIssue({ code: "custom", message: "El teléfono contiene caracteres inválidos" });
    return;
  }
  if (!isValidArgentinePhone(value)) {
    ctx.addIssue({ code: "custom", message: "Ingresá un teléfono argentino válido: código de área y número (10 dígitos)" });
  }
});

const brandValueSchema = z.string().trim().min(2, "La marca debe tener al menos 2 caracteres")
  .max(50, "La marca no puede superar 50 caracteres")
  .regex(VEHICLE_BRAND, "La marca del vehículo contiene caracteres inválidos");

export const optionalPhoneSchema = z.preprocess(
  (value) => value === "" ? undefined : value,
  phoneValueSchema.nullable().optional(),
);
export const optionalBrandSchema = z.preprocess(
  (value) => value === "" ? undefined : value,
  brandValueSchema.nullable().optional(),
);
export const optionalPlateSchema = z.preprocess(
  (value) => value === "" || value === null ? undefined : value,
  licensePlateSchema.optional(),
);

const emailSchema = z.string().trim().email("Email inválido").transform((value) => value.toLowerCase());
const nameSchema = z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100);
const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100);
const loginPasswordSchema = z.string().min(1, "Ingresá tu contraseña").max(100);
const roleSchema = z.enum(["ADMIN", "CLIENTE", "INVITADO"]);

const captchaTokenSchema = z.string().trim().min(20, "Completá la verificación de seguridad").optional();

export const loginSchema = z.object({ email: emailSchema, password: loginPasswordSchema, captchaToken: captchaTokenSchema }).strict();
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: optionalPhoneSchema,
  patente: licensePlateSchema,
  brand: optionalBrandSchema,
  assignedSpotId: z.coerce.number().int().positive(),
  captchaToken: captchaTokenSchema,
}).strict();
export const guestLoginSchema = z.object({
  licensePlate: licensePlateSchema,
  brand: optionalBrandSchema,
  spotId: z.coerce.number().int().positive().optional(),
  captchaToken: captchaTokenSchema,
}).strict();

export const adminCreateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: optionalPhoneSchema,
  role: roleSchema.default("CLIENTE"),
  patente: optionalPlateSchema,
  brand: optionalBrandSchema,
  assignedSpotId: z.coerce.number().int().positive().nullable().optional(),
}).strict();
export const adminUpdateUserSchema = adminCreateUserSchema.partial().extend({
  password: passwordSchema.optional(),
}).strict();

const positiveDimension = z.coerce.number().positive().finite().nullable().optional();
export const vehicleCreateSchema = z.object({
  licensePlate: licensePlateSchema,
  userId: z.coerce.number().int().positive().nullable().optional(),
  brand: optionalBrandSchema,
  heightCm: positiveDimension,
  widthCm: positiveDimension,
  weightKg: positiveDimension,
}).strict();
export const vehicleUpdateSchema = vehicleCreateSchema.partial().strict();

export const parkingSpotUpdateSchema = z.object({
  label: z.string().trim().toUpperCase().min(1).max(8).regex(/^[A-Z0-9-]+$/, "Etiqueta inválida").optional(),
  spotType: z.enum(["NORMAL", "DISABLED", "EV_CHARGING", "MOTORCYCLE"]).optional(),
  maxWidthCm: z.coerce.number().min(100).max(600).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, "No hay cambios válidos");
export const parkingSpotAssignmentSchema = z.object({
  userId: z.coerce.number().int().positive().nullable(),
}).strict();
export const parkingSessionMoveSchema = z.object({
  sessionId: z.coerce.number().int().positive(),
}).strict();
export const parkingSpotRelocateSchema = z.object({
  targetSpotId: z.coerce.number().int().positive(),
}).strict();
export const clientSpotSelectionSchema = z.object({
  spotId: z.coerce.number().int().positive().nullable(),
}).strict();

export const parkingEntrySchema = z.object({
  vehicleId: z.coerce.number().int().positive(),
  spotId: z.coerce.number().int().positive(),
}).strict();
