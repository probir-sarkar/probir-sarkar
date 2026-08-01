import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from 'sonner'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Probir Sarkar - Full Stack Developer',
      },
      {
        name: 'description',
        content:
          'Probir Sarkar is a full-stack developer with expertise in web development, software engineering, and technology. He has experience working on a variety of projects, including web applications, mobile apps, and data analysis tools. His skills include JavaScript, React, Node.js, and more.',
      },
      { property: 'og:title', content: 'Probir Sarkar - Full Stack Developer' },
      {
        property: 'og:description',
        content:
          'Probir Sarkar is a full-stack developer with expertise in web development, software engineering, and technology. He has experience working on a variety of projects, including web applications, mobile apps, and data analysis tools. His skills include JavaScript, React, Node.js, and more.',
      },
      {
        property: 'og:image',
        content:
          'https://ik.imagekit.io/probir/probirsarkar.com/og-image.jpg?updatedAt=1716879552254',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere bg-secondary">
        {children}
        <Toaster richColors />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
