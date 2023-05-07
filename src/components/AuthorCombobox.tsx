"use client";

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
import { api, type RouterOutputs } from "@/utils/api";
import {
  CaretSortIcon,
  CheckIcon,
  Cross1Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import {
  useRef,
  useState,
  type MouseEvent,
  type SetStateAction,
  type Dispatch,
} from "react";

type AuthorComboboxProps = {
  repoFullName: string | undefined;
  author: string;
  setAuthor: Dispatch<SetStateAction<string>>;
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
        const authors = data.reduce<
          Record<string, RouterOutputs["getCommits"][0]["author"]>
        >((acc, { author }) => {
          const authorKey = author.username.toLowerCase();
          if (!acc[authorKey]) acc[authorKey] = author;
          return acc;
        }, {});
        return authors;
      },
    }
  );

  const handleSelectAuthor = (authorKey: string) => {
    setAuthor((prevAuthor) => (authorKey === prevAuthor ? "" : authorKey));
    setOpen(false);
  };

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
            {author ? (
              <>
                {authorAvatarUrl && (
                  <Image
                    className="rounded-full"
                    width={20}
                    height={20}
                    src={`${authorAvatarUrl}?size=20`}
                    alt={`${author} avatar`}
                  />
                )}
                {authors.data?.[author]?.username}
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
      <PopoverContent className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search author..." />
          <CommandEmpty>No author found.</CommandEmpty>
          <CommandGroup className="max-h-80 overflow-auto scroll-p-3">
            {authors.data &&
              Object.entries(authors.data).map(
                ([authorKey, { username, avatar_url }]) => (
                  <CommandItem
                    className="truncate"
                    key={authorKey}
                    value={authorKey}
                    onSelect={handleSelectAuthor}
                  >
                    {authorKey === author ? (
                      <CheckIcon className="mr-2 h-4 w-4" />
                    ) : avatar_url ? (
                      <Image
                        className="mr-2 rounded-full"
                        width={16}
                        height={16}
                        src={`${avatar_url}?size=20`}
                        alt={`${author} avatar`}
                      />
                    ) : (
                      <PersonIcon className="mr-2 h-4 w-4 opacity-50" />
                    )}
                    <p className="truncate">{username}</p>
                  </CommandItem>
                )
              )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
