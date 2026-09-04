import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { DefaultNotFound } from 'fumadocs-ui/layouts/home/not-found';
import type { ReactNode } from 'react';
import type { MetaDescriptor } from 'react-router';

import { baseOptions } from '@/lib/layout.shared.tsx';

export function meta(): MetaDescriptor[] {
  return [{ title: 'Not Found' }];
}

export default function NotFound(): ReactNode {
  return (
    <HomeLayout {...baseOptions()}>
      <DefaultNotFound />
    </HomeLayout>
  );
}
