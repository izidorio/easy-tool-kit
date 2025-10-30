interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function Root({ children, ...rest }: RootProps) {
  return <div {...rest}>{children}</div>;
}
