import { ElementType } from "react";
import { Control, FieldError, Validate } from "react-hook-form";

export interface FormComponentProp {
  control: Control;
  name: string;
  displayName: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  error?: FieldError;
  errorMessage?: string;
  disabled?: boolean;
  as?: ElementType;
  validate?: Validate<any> | Record<string, Validate<any>> | undefined;
}
