"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

export default function SearchBar({ search, setSearch }: SearchBarProps) {
  return (
    <div className="border-y border-kora">
      <div className="relative flex items-center">
        <Search
          size={19}
          strokeWidth={1.5}
          className="absolute left-0 text-thread-grey"
        />

        <input
          type="text"
          placeholder="Search the collection"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full
            border-none
            bg-transparent
            py-6
            pl-9
            pr-4
            font-editorial
            text-lg
            text-thread-black
            outline-none
            placeholder:text-thread-grey
          "
        />
      </div>
    </div>
  );
}
