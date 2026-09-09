import { SquareArrowOutUpRight } from 'lucide-react';
import { type FC, useMemo } from 'react';

import { baseOptions } from '../lib/layout.shared.tsx';

interface GithubSourceProps {
  link: string;
  label?: string;
}

const GithubSource: FC<GithubSourceProps> = ({ link, label }) => {
  const url = useMemo(() => {
    const base = baseOptions().githubUrl;
    const path = link.replace(/^\//u, '');

    return `${base}/blob/master/${path}`;
  }, [link]);

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center gap-1 text-sm'
    >
      {label ?? 'View on GitHub'}
      <SquareArrowOutUpRight size={15} />
    </a>
  );
};

export default GithubSource;
