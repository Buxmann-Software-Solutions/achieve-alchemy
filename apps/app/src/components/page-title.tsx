interface PageTitleProps {
  title: string;
}

export const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {title}
    </h3>
  );
};
