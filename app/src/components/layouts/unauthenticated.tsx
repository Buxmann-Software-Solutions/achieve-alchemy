interface UnauthenticatedLayoutProps {
  button: React.ReactNode;
  imageLink: string;
  quote: string;
  author: string;
  children: React.ReactNode;
}

export function UnauthenticatedLayout({
  button,
  imageLink,
  quote,
  author,
  children,
}: UnauthenticatedLayoutProps) {
  return (
    <>
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="container relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          {button}
          <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
            <img
              src={imageLink}
              alt="Authentication"
              className="absolute grayscale hidden md:block inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-70" />
            <div className="relative z-20 flex items-center text-lg font-medium">
              Flowz
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">&ldquo;{quote}&rdquo;</p>
                <footer className="text-sm">{author}</footer>
              </blockquote>
            </div>
          </div>
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
              <div className="flex flex-col space-y-2 text-center">
                {children}
              </div>
              <p className="px-8 text-center text-sm text-[hsl(0,0%,45.1%)]">
                By clicking continue, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-4 hover:text-[hsl(0,0%,9%)]"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-[hsl(0,0%,9%)]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
