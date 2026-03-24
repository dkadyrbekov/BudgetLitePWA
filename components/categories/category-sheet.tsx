"use client";

import emojiData from "@emoji-mart/data";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { CategoryListItem } from "@/lib/categories";

type CategorySheetProps = {
  mode?: "create" | "edit";
  triggerClassName: string;
  triggerLabel: string;
  category?: CategoryListItem;
};

type EmojiEntry = {
  id: string;
  emoji: string;
  name: string;
  keywords: string[];
};

type EmojiCategory = {
  id: string;
  label: string;
  emojis: EmojiEntry[];
};

const EMOJI_CATEGORY_LABELS: Record<string, string> = {
  people: "Smileys & People",
  nature: "Animals & Nature",
  foods: "Food & Drink",
  activity: "Activities",
  places: "Travel & Places",
  objects: "Objects",
  symbols: "Symbols",
  flags: "Flags",
};

const EMOJI_CATEGORIES = buildEmojiCategories();

export function CategorySheet({
  mode = "create",
  triggerClassName,
  triggerLabel,
  category,
}: CategorySheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "");
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(EMOJI_CATEGORIES[0]?.id ?? "people");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSave = useMemo(
    () => name.trim().length > 0 && icon.trim().length > 0,
    [icon, name],
  );

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return EMOJI_CATEGORIES;
    }

    return EMOJI_CATEGORIES.map((category) => ({
      ...category,
      emojis: category.emojis.filter((emoji) => {
        const haystack = `${emoji.name} ${emoji.keywords.join(" ")}`.toLowerCase();
        return haystack.includes(query);
      }),
    })).filter((category) => category.emojis.length > 0);
  }, [search]);

  const visibleCategoryId =
    filteredCategories.find((category) => category.id === activeCategoryId)?.id ??
    filteredCategories[0]?.id ??
    activeCategoryId;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function openSheet() {
    setName(category?.name || "");
    setIcon(category?.icon || "");
    setSearch("");
    setActiveCategoryId(EMOJI_CATEGORIES[0]?.id ?? "people");
    setIsEmojiPickerOpen(false);
    setError(null);
    setIsOpen(true);
  }

  function closeSheet() {
    if (isPending) {
      return;
    }

    setIsOpen(false);
    setIsEmojiPickerOpen(false);
    setSearch("");
    setError(null);
  }

  function resetForm() {
    setName("");
    setIcon("");
    setSearch("");
    setActiveCategoryId(EMOJI_CATEGORIES[0]?.id ?? "people");
    setIsEmojiPickerOpen(false);
    setError(null);
  }

  function handleEmojiSelect(value: string) {
    setIcon(value);
    setIsEmojiPickerOpen(false);
    setSearch("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        mode === "edit" && category
          ? await updateCategory({
              id: category.id,
              name,
              icon,
            })
          : await createCategory({
              name,
              icon,
            });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (mode === "create") {
        resetForm();
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openSheet}>
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <button
            type="button"
            aria-label="Close category sheet"
            className="absolute inset-0"
            onClick={closeSheet}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-sheet-title"
            className="relative z-10 w-full rounded-t-[2rem] bg-[var(--background)] px-4 pb-5 pt-3 shadow-2xl"
          >
            <div className="mx-auto h-1.5 w-14 rounded-full bg-black/10" />

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Categories
                </p>
                <h2
                  id="category-sheet-title"
                  className="mt-2 text-2xl font-semibold tracking-tight text-black"
                >
                  {mode === "edit" ? "Edit Category" : "New Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-zinc-600"
              >
                Close
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Emoji
                </span>
                <div className="rounded-[1.75rem] border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-zinc-50 text-4xl">
                      {icon.trim() || "🙂"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-black">
                        Chosen emoji
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Open the picker to browse all emoji categories.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(true)}
                    className="mt-4 flex h-14 w-full items-center justify-center rounded-[1.25rem] border border-black/10 bg-zinc-50 px-4 text-sm font-semibold text-black transition active:scale-[0.99]"
                  >
                    Choose Emoji
                  </button>
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Name
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Groceries"
                  className="h-14 w-full rounded-[1.75rem] border border-black/10 bg-white px-5 text-lg font-medium text-black outline-none transition focus:border-black/30"
                />
              </label>

              {error ? (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <div className="sticky bottom-0 -mx-4 border-t border-black/10 bg-[var(--background)] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
                <button
                  type="submit"
                  disabled={!canSave || isPending}
                  className="flex h-14 w-full items-center justify-center rounded-[1.25rem] bg-black text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending
                    ? "Saving..."
                    : mode === "edit"
                      ? "Save Changes"
                      : "Save Category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isOpen && isEmojiPickerOpen ? (
        <div className="fixed inset-0 z-[60] bg-[var(--background)]">
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between gap-4 border-b border-black/10 bg-white px-4 py-4">
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(false)}
                className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-zinc-700"
              >
                Back
              </button>

              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Emoji picker
                </p>
                <h3 className="mt-1 text-lg font-semibold text-black">
                  Choose Emoji
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-2xl">
                {icon.trim() || "🙂"}
              </div>
            </header>

            <div className="border-b border-black/10 bg-white px-4 py-3">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search emoji"
                className="h-12 w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 text-sm text-black outline-none"
              />
            </div>

            <div className="border-b border-black/10 bg-white px-3 py-2">
              <div className="flex gap-2 overflow-x-auto">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategoryId(category.id)}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${
                      visibleCategoryId === category.id
                        ? "bg-black text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) =>
                  category.id === visibleCategoryId ? (
                    <section key={category.id}>
                      <p className="mb-3 text-sm font-semibold text-black">
                        {category.label}
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {category.emojis.map((emoji) => (
                          <button
                            key={emoji.id}
                            type="button"
                            onClick={() => handleEmojiSelect(emoji.emoji)}
                            className={`flex h-12 items-center justify-center rounded-2xl border text-2xl transition ${
                              icon === emoji.emoji
                                ? "border-black bg-black text-white"
                                : "border-black/10 bg-white"
                            }`}
                            title={emoji.name}
                          >
                            {emoji.emoji}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null,
                )
              ) : (
                <div className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-zinc-600">
                  No emojis found for that search.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function buildEmojiCategories(): EmojiCategory[] {
  const data = emojiData as {
    categories: Array<{ id: string; emojis: string[] }>;
    emojis: Record<
      string,
      {
        id: string;
        name: string;
        keywords?: string[];
        skins: Array<{ native: string }>;
      }
    >;
  };

  return data.categories
    .map((category) => ({
      id: category.id,
      label: EMOJI_CATEGORY_LABELS[category.id] ?? category.id,
      emojis: category.emojis
        .map((emojiId) => {
          const emoji = data.emojis[emojiId];

          if (!emoji?.skins?.[0]?.native) {
            return null;
          }

          return {
            id: emoji.id,
            emoji: emoji.skins[0].native,
            name: emoji.name,
            keywords: emoji.keywords ?? [],
          };
        })
        .filter((emoji): emoji is EmojiEntry => emoji !== null),
    }))
    .filter((category) => category.emojis.length > 0);
}
