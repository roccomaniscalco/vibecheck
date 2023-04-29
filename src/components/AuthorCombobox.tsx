"use client";

import {
  CheckIcon,
  CaretSortIcon,
  Cross1Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { type MouseEvent, useState, useRef } from "react";

import { Button } from "@/components/ui/clickable";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/utils/api";
import Image from "next/image";

type AuthorComboboxProps = {
  repoFullName: string | undefined;
  author: string;
  setAuthor: (newAuthor: string) => void;
};

export function AuthorCombobox({
  repoFullName,
  author,
  setAuthor,
}: AuthorComboboxProps) {
  const PopoverTriggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const authors = api.getCommits.useQuery(
    { repoFullName: repoFullName as string },
    {
      enabled: !!repoFullName,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
      select: (data) => {
        const authors = data.reduce((acc, curr) => {
          if (curr.author.login && !acc[curr.author.login]) {
            acc[curr.author.login] = {
              name: curr.author.name,
              avatar_url: curr.author.avatar_url,
            };
          }
          return acc;
        }, {} as Record<string, { name: string; avatar_url: string | undefined }>);
        return authors;
      },
    }
  );

  const handleClearAuthor = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    PopoverTriggerButtonRef.current?.focus();
    setAuthor("");
  };

  const authorAvatarUrl = authors.data?.[author]?.avatar_url;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            ref={PopoverTriggerButtonRef}
            role="combobox"
            aria-expanded={open}
            className="flex w-56 items-center gap-2 px-3 py-2"
          >
            {author && authorAvatarUrl ? (
              <>
                <Image
                  className=" block rounded-full"
                  width={20}
                  height={20}
                  src={`${authorAvatarUrl}?size=20`}
                  alt={`${author} avatar`}
                />
                {author}
              </>
            ) : (
              <p className="pl-1">Filter by author...</p>
            )}
            {!author && (
              <CaretSortIcon className="ml-auto h-4 w-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        {author && (
          <Button
            className="absolute top-0 right-0 flex h-9 w-9 items-center justify-center"
            onClick={handleClearAuthor}
          >
            <Cross1Icon className="h-4 w-4 opacity-50" />
          </Button>
        )}
      </div>
      <PopoverContent className="w-56 p-0" align="end" /*sideOffset={-36}*/>
        <Command>
          <CommandInput placeholder="Search author..." />
          <CommandEmpty>No author found.</CommandEmpty>
          <CommandGroup>
            {authors.data &&
              Object.entries(authors.data).map(([login, { avatar_url }]) => (
                <CommandItem
                  className="truncate"
                  key={login}
                  onSelect={() => {
                    setAuthor(login === author ? "" : login);
                    setOpen(false);
                  }}
                >
                  {login === author ? (
                    <CheckIcon className="mr-2 h-4 w-4" />
                  ) : avatar_url ? (
                    <Image
                      className="mr-2 block rounded-full"
                      width={16}
                      height={16}
                      src={`${avatar_url}?size=20`}
                      alt={`${author} avatar`}
                    />
                  ) : (
                    <PersonIcon className="h-4 w-4 opacity-50" />
                  )}
                  <p className="truncate">{login}</p>
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
