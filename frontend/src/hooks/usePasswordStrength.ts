import { useState, useEffect } from "react";

export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState("");

  useEffect(() => {
    if (!password) {
      setStrength("");
      return;
    }

    const lengthCriteria = password.length >= 8;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const numberCriteria = /[0-9]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const passedCriteria = [lengthCriteria, uppercaseCriteria, numberCriteria, specialCharCriteria].filter(Boolean).length;

    if (passedCriteria <= 1) {
      setStrength("Weak");
    } else if (passedCriteria === 2 || passedCriteria === 3) {
      setStrength("Medium");
    } else if (passedCriteria === 4) {
      setStrength("Strong");
    }
  }, [password]);

  return strength;
}
