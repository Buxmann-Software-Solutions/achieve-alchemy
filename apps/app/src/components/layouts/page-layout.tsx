import { PageTitle } from "@/components/page-title";

interface PageLayoutProps {
  title: string;
  subTitle?: string;
  children: React.ReactNode;
}

export const PageLayout = ({ title, subTitle, children }: PageLayoutProps) => {
  return (
    <div className="p-4 space-y-[20px] w-full mx-auto h-full flex flex-col">
      <div className="justify-between flex items-center">
        <div>
          <PageTitle title={title} />
          <div>{subTitle}</div>
        </div>
      </div>
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
};
