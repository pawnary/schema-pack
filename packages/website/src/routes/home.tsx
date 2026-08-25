import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Binary, Bug, Gauge, TestTube2, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';

import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Schema Pack' },
    {
      name: 'description',
      content:
        'Serialization tooling for TypeScript and JavaScript — encoders/decoders, byte-level debugging, benchmarking, and test utilities for binary formats.',
    },
  ];
}

const packages = [
  {
    icon: Binary,
    name: '@schema-pack/message-pack',
    description: 'Incremental MessagePack encoder/decoder with a pluggable extension system.',
    href: '/docs/message-pack',
  },
  {
    icon: Bug,
    name: '@schema-pack/debugger',
    description: 'Format-agnostic, byte-level debugger for binary serialization formats.',
    href: '/docs/debugger',
  },
  {
    icon: Gauge,
    name: '@schema-pack/benchmark',
    description: 'Benchmark suite for comparing serializer implementations across data types.',
    href: '/docs/benchmark',
  },
  {
    icon: TestTube2,
    name: '@schema-pack/vitest',
    description: 'Vitest matchers for asserting on Uint8Array byte content.',
    href: '/docs/vitest',
  },
];

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className='flex flex-1 flex-col'>
        <section className='relative flex flex-col items-center gap-6 overflow-hidden px-4 py-24 text-center sm:py-32'>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 -z-10'
            style={{
              background:
                'radial-gradient(circle at 50% 0%, hsl(from var(--color-fd-primary) h s l / 10%), transparent 60%)',
            }}
          />

          <span className='rounded-full border border-fd-border bg-fd-secondary px-3 py-1 text-xs font-medium text-fd-muted-foreground'>
            Work in progress — API not stable yet
          </span>

          <h1 className='max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl'>
            Serialization tooling, byte by byte.
          </h1>

          <p className='max-w-xl text-balance text-fd-muted-foreground sm:text-lg'>
            Encoders and decoders, a byte-level debugger, a benchmark harness, and
            test matchers for binary formats — built for TypeScript and JavaScript.
          </p>

          <div className='flex flex-wrap items-center justify-center gap-3'>
            <Link
              to='/docs'
              className='inline-flex items-center gap-2 rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90'
            >
              Get Started
              <ArrowRight className='size-4' />
            </Link>
            <a
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent'
            >
              GitHub
              <ExternalLink className='size-4' />
            </a>
          </div>

          <pre className='mt-4 w-full max-w-lg overflow-x-auto rounded-xl border border-fd-border bg-fd-card p-4 text-left font-mono text-sm text-fd-card-foreground'>
            <code>{`import { encode, decode } from '@schema-pack/message-pack';

const buffer = encode({ hello: 'world', values: [1, 2, 3] });
const value = decode(buffer);
// { hello: 'world', values: [1, 2, 3] }`}</code>
          </pre>
        </section>

        <section className='border-t border-fd-border px-4 py-16'>
          <div className='mx-auto grid max-w-5xl gap-4 sm:grid-cols-2'>
            {packages.map(({ icon: Icon, name, description, href }) => (
              <Link
                key={href}
                to={href}
                className='group flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:bg-fd-accent'
              >
                <div className='w-fit rounded-lg border border-fd-border bg-fd-muted p-1.5 text-fd-muted-foreground'>
                  <Icon className='size-4' />
                </div>
                <h2 className='font-mono text-sm font-semibold'>{name}</h2>
                <p className='text-sm text-fd-muted-foreground'>{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </HomeLayout>
  );
}
