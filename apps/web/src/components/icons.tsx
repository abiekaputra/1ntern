// Module responsible for rendering the compact icon vocabulary used by 1ntern.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ControlIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h10M18 7h2M4 17h2m4 0h10M14 4v6M10 14v6" />
  </Icon>
);
export const RunsIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 3v18M6 7h9l3 3-3 3H6" />
  </Icon>
);
export const ShieldIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3 4.5 6v5.4c0 4.5 3 7.6 7.5 9.6 4.5-2 7.5-5.1 7.5-9.6V6L12 3Z" />
    <path d="m9 12 2 2 4-5" />
  </Icon>
);
export const AuditIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" />
  </Icon>
);
export const ArrowIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 5 7 7-7 7" />
  </Icon>
);
export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12 4 4L19 6" />
  </Icon>
);
export const RotateIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 4v6h6M20 20v-6h-6" />
    <path d="M5.5 15a7 7 0 0 0 12 2M18.5 9a7 7 0 0 0-12-2" />
  </Icon>
);
