import { InputAdornment, SvgIconTypeMap, TextField } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { MuiTextFieldProps } from "@mui/x-date-pickers/internals";
import React from "react";

interface IProps {
  iconStart?: React.ReactNode;
  label?: string;
  iconEnd?: React.ReactNode;
  InputProps?: MuiTextFieldProps;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const IconTextField = ({
  iconStart,
  iconEnd,
  InputProps,
  onChange,
  value,
  label,
  className = "",
}: IProps) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      className={className}
      InputProps={{
        startAdornment: iconStart ? (
          <InputAdornment position="start">{iconStart}</InputAdornment>
        ) : null,
        endAdornment: iconEnd ? (
          <InputAdornment position="end">{iconEnd}</InputAdornment>
        ) : null,
      }}
    />
  );
};

export default IconTextField;
