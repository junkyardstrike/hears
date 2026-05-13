import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | undefined;
  onChange: (val: number) => void;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Local state to manage the string representation (allows empty string while typing)
    const [displayValue, setDisplayValue] = React.useState<string>(
      value !== undefined ? value.toString() : "0"
    );

    // Update local state when parent value changes
    React.useEffect(() => {
      if (value !== undefined) {
        const strVal = value.toString();
        // Only update if the numerical value is different to avoid cursor jumping
        if (parseInt(displayValue, 10) !== value && !(displayValue === "" && value === 0)) {
          setDisplayValue(strVal);
        }
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawVal = e.target.value;
      
      // Convert Zen-kaku numbers to Han-kaku
      const normalizedVal = rawVal.replace(/[０-９]/g, (s) => 
        String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      );
      
      // Allow only digits (prevent non-numeric input including full-width chars that aren't numbers)
      const numericVal = normalizedVal.replace(/[^\d]/g, '');

      setDisplayValue(numericVal);
      
      // Notify parent of the change
      const num = parseInt(numericVal, 10);
      onChange(isNaN(num) ? 0 : num);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (displayValue === "") {
        setDisplayValue("0");
        onChange(0);
      }
      if (props.onBlur) props.onBlur(e);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(className)}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"

export { NumericInput }
