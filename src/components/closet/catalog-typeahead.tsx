"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useCatalogSearch } from "@/hooks/use-catalog-search";

interface CatalogSuggestion {
  brand: string;
  model: string;
  categorySuggestion: string | null;
}

interface CatalogTypeaheadProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: CatalogSuggestion) => void;
}

export function CatalogTypeahead({ value, onChange, onSelect }: CatalogTypeaheadProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data: results } = useCatalogSearch(value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = results ?? [];
  const showDropdown = open && value.length >= 2 && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search or type a name..."
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border shadow-md">
          {suggestions.map((item) => (
            <li
              key={item.id}
              className="hover:bg-accent cursor-pointer px-3 py-2 text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect({
                  brand: item.brand,
                  model: item.model,
                  categorySuggestion: item.categorySuggestion,
                });
                onChange(item.brand ? `${item.brand} ${item.model}` : item.model);
                setOpen(false);
                // Fire-and-forget: bump popularity
                if (item.id) {
                  fetch("/api/catalog/select", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: item.id }),
                  }).catch(() => {});
                }
              }}
            >
              <span className="font-medium">{item.brand}</span>
              {item.brand && item.model && <span className="text-muted-foreground"> &mdash; </span>}
              <span>{item.model}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
