import { Link, LinkProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const linkStyles = {
  default: {
    color: "var(--primary)",
    transition: "color 0.3s ease",
    "&:hover": {
      color: "var(--secondary)",
      textDecoration: "underline",
    },
  },
  danger: {
    color: "var(--danger)",
    transition: "color 0.3s ease",
    "&:hover": {
      color: "var(--danger-hover)",
      textDecoration: "underline",
    },
  },
  success: {
    color: "var(--success)",
    transition: "color 0.3s ease",
    "&:hover": {
      color: "var(--success-hover)",
      textDecoration: "underline",
    },
  },
};

type LinkVariant = keyof typeof linkStyles;

const MyLink = styled(Link)<LinkProps & { customvariant?: LinkVariant }>(
  ({ customvariant = "default" }) => ({
    ...linkStyles[customvariant as LinkVariant],
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  }),
);

export { MyLink };
