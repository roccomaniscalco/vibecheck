import { Button } from "@/components/ui/clickable";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { LoadingGradient } from "@/components/ui/gradient";
import { api } from "@/utils/api";
import { useDebounce } from "@/utils/useDebounce";
import { FileIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
  const isDebouncing = debouncedSearchTerm !== searchTerm;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const apiContext = api.useContext();
  const repoSearchResults = api.searchRepos.useQuery(
    { query: debouncedSearchTerm },
    {
      enabled: debouncedSearchTerm.length > 0,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
      onSettled: (): void => {
        void apiContext.getRateLimit.invalidate();
      },
    }
  );

  const router = useRouter();

  const handleSearchResultSelect = (repoFullName: string) => {
    setOpen(false);
    void router.push(`/${repoFullName}`);
  };

  const handleOpenButtonClick = () => {
    setOpen((open) => !open);
  };

  const handleSearchInputChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const showLoadingBar =
    (isDebouncing ||
      repoSearchResults.isFetching ||
      repoSearchResults.isLoading) &&
    searchTerm.length > 0;

  const showNoneFound =
    searchTerm.length > 0 && repoSearchResults.data?.length === 0;

  const showSearchResults =
    searchTerm.length > 0 &&
    repoSearchResults.data &&
    repoSearchResults.data?.length > 0;

  return (
    <>
      <Button
        onClick={handleOpenButtonClick}
        className="flex items-center gap-2 px-3 py-2"
      >
        <MagnifyingGlassIcon className="h-4 w-4 opacity-50" />
        Search...
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-100 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search public GitHub repositories..."
          value={searchTerm}
          onValueChange={handleSearchInputChange}
        />
        <div className="h-0">
          {showLoadingBar && <LoadingGradient className="-my-[1px]" />}
        </div>
        <CommandList>
          {showNoneFound && <CommandEmpty>No repositories found.</CommandEmpty>}
          {showSearchResults && (
            <CommandGroup>
              {repoSearchResults.data?.map((repo) => (
                <CommandItem
                  key={repo.id}
                  value={repo.full_name}
                  onSelect={handleSearchResultSelect}
                  className="flex gap-2 overflow-hidden"
                >
                  <FileIcon className="h-5 w-5 text-slate-400" />
                  <p className="flex-1 truncate">{repo.full_name}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {repoSearchResults.isError && (
            <CommandEmpty>
              {repoSearchResults.error.data?.httpStatus &&
                `${repoSearchResults.error.data.httpStatus}: `}
              {repoSearchResults.error.message}
            </CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
