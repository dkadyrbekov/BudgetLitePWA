"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSave = useMemo(() => name.trim().length > 0 && icon.trim().length > 0, [icon, name]);

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
    setError(null);
  }

  function resetForm() {
    setName("");
    setIcon("");
    setIsEmojiPickerOpen(false);
    setError(null);
  }

  function handleEmojiClick(emojiData: { native: string }) {
    setIcon(emojiData.native);
    setIsEmojiPickerOpen(false);
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

            <div className="min-h-0 flex-1 p-3">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiClick}
                theme="light"
                emojiSize={22}
                emojiButtonSize={40}
                previewPosition="none"
                searchPosition="sticky"
                navPosition="top"
                perLine={8}
                maxFrequentRows={1}
                skinTonePosition="none"
                set="native"
                locale="en"
                autoFocus
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
