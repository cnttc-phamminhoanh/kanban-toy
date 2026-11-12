import { CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';

import factoryIcon from '@client/src/assets/factory-icon.png';
import { Image } from '@client/src/components/ui/image';

import { formatBoardDate, formatBoardTime } from '@client/src/utils/datetime';
import { useNow } from '@client/src/hooks/use-now';
import { useI18n } from '@client/src/i18n/I18nContext';

interface BoardHeaderProps {
  rightSlot?: ReactNode;
}

const BoardHeader = ({ rightSlot }: BoardHeaderProps) => {
  const now = useNow();
  const { lang } = useI18n();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-[1680px] items-center justify-between gap-4 px-6 md:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Image
            src={factoryIcon}
            alt=""
            width={36}
            height={36}
            aria-hidden
            className="size-9 shrink-0 object-contain"
          />
          <h1 className="font-display truncate text-[26px] font-extrabold leading-none text-foreground md:text-[32px]">
            F11 <span className="text-primary">Dashboard</span>
          </h1>
        </div>
        {rightSlot ?? (
          <div className="hidden shrink-0 items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2.5 text-[15px] font-semibold text-foreground sm:flex">
            <CalendarDays className="size-[18px] text-primary" aria-hidden />
            <span className="tnum whitespace-nowrap">
              {formatBoardDate(now, lang)} · {formatBoardTime(now)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default BoardHeader;
