"use client";

import { CheckIcon, ChevronDownIcon, PersonIcon } from "@radix-ui/react-icons";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  const authors = api.getCommits.useQuery(
    { repoFullName: repoFullName as string },
    {
      enabled: !!repoFullName,
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

  const authorAvatarUrl = authors.data?.[author]?.avatar_url;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
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
            <>
              <PersonIcon className="h-4 w-4 opacity-50" />{" "}
              {"Filter by author..."}
            </>
          )}
          <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <Command>
          <CommandInput placeholder="Search author..." />
          <CommandEmpty>No author found.</CommandEmpty>
          <CommandGroup>
            {authors.data &&
              Object.entries(authors.data).map(([login, { avatar_url }]) => (
                <CommandItem
                  key={login}
                  onSelect={() => {
                    setAuthor(login === author.toLowerCase() ? "" : login);
                    setOpen(false);
                  }}
                >
                  {login === author ? (
                    <CheckIcon className="mr-2 h-4 w-4" />
                  ) : avatar_url ? (
                    <Image
                      className="mr-2 block rounded-full"
                      width={20}
                      height={20}
                      src={`${avatar_url}?size=20`}
                      alt={`${author} avatar`}
                    />
                  ) : (
                    <PersonIcon className="h-4 w-4 opacity-50" />
                  )}
                  {login}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
