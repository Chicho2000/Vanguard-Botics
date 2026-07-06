import React from "react";
import { VEHICLE_BRANDS } from "../lib/vehicle-brands";

interface BrandSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export const BrandSelect: React.FC<BrandSelectProps> = ({ value, onChange, className = "", required }) => {
  const isKnown = VEHICLE_BRANDS.some((brand) => brand !== "Otro" && brand === value);
  const selectValue = !value ? "" : isKnown ? value : "Otro";
  return (
    <div className="space-y-2">
      <select
        value={selectValue}
        onChange={(event) => onChange(event.target.value === "Otro" ? "Otro" : event.target.value)}
        required={required}
        className={className}
      >
        <option value="">Seleccionar marca</option>
        {VEHICLE_BRANDS.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
      </select>
      {selectValue === "Otro" && (
        <input
          value={value === "Otro" ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          required
          placeholder="Escribí la marca"
          className={className}
        />
      )}
    </div>
  );
};
