import { RootProvider } from 'fumadocs-ui/provider/react-router';
import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  type LinksFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import './app.css';
import type { Route } from './+types/root.ts';
import { favicon } from './constants.ts';
import NotFound from './routes/not-found.tsx';

export const links: LinksFunction = () => [
  { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
  {
    crossOrigin: 'anonymous',
    href: 'https://fonts.gstatic.com',
    rel: 'preconnect',
  },
  {
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    rel: 'stylesheet',
  },
];

export function Layout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1'
        />
        <link
          rel='icon'
          type='image/x-icon'
          href={favicon}
        />
        <Meta />
        <Links />
      </head>
      <body className='flex flex-col min-h-screen'>
        <RootProvider
          theme={{
            enabled: true,
          }}
          search={{
            enabled: false,
          }}
        >
          {children}
        </RootProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App(): ReactNode {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): ReactNode {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }
    message = 'Error';
    details = error.statusText;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='pt-16 p-4 w-full max-w-[1400px] mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack !== undefined && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
