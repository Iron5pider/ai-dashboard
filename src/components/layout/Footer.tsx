export function Footer() {
  return (
    <footer className="border-t py-4 md:py-6">
      <div className="px-4 md:px-6 2xl:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Next.js
            </a>
            {" and "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              shadcn/ui
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

