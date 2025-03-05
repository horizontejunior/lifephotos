import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Input = (props: InputProps) => {
  return (
    <input {...props} className="border-2 border- rounded-md p-2" />
  );
};
