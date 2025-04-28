import { Button, ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const buttonStyles = {
  default: {
    backgroundColor: "var(--primary)",
    color: "var(--background)",
    "&:hover": {
      backgroundColor: "var(--secondary)",
    },
  },

  cancel: {
    backgroundColor: "var(--neutral)",
    color: "var(--primary)",
    "&:hover": {
      backgroundColor: "var(--accent)",
    },
  },

  delete: {
    backgroundColor: "var(--error)",
    color: "var(--background)",
    "&:hover": {
      backgroundColor: "var(--error-darker)",
    },
  },

  confirm: {
    backgroundColor: "var(--success)",
    color: "var(--primary)",
    "&:hover": {
      backgroundColor: "var(--success-darker)",
    },
  },

  edit: {
    backgroundColor: "var(--info)",
    color: "var(--primary)",
    "&:hover": {
      backgroundColor: "var(--info-darker)",
    },
  },
};

type ButtonVariant = keyof typeof buttonStyles;
type ButtonSize = "small" | "medium";

const sizeStyles = {
  small: {
    fontSize: "14px",
    padding: "5px 10px",
  },
  medium: {
    fontSize: "16px",
    padding: "10px 20px",
  },
};

const MyButton = styled(Button)<
  ButtonProps & { customvariant?: ButtonVariant; customsize?: ButtonSize }
>(({ customvariant = "default", customsize = "medium" }) => ({
  ...buttonStyles[customvariant as ButtonVariant],
  ...sizeStyles[customsize as ButtonSize],
  fontWeight: "bold",
  textTransform: "none",
}));

export { MyButton };
