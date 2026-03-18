"use client";

import { useState } from "react";

import { useBudgetData } from "@/hooks/use-budget-data";
import type { BudgetCategory } from "@/lib/types";

type DraftCategory = {
  name: string;
  icon: string;
};

const EMPTY_DRAFT: DraftCategory = {
  name: "",
  icon: "",
};

export function CategoriesManager() {
  const {
    categories,
    createCategory,
    editCategory,
    error,
    loading,
    moveCategory,
    removeCategory,
  } = useBudgetData();
  const [draft, setDraft] = useState<DraftCategory>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const name = draft.name.trim();
  const icon = draft.icon.trim();
  const canSubmit = Boolean(name && icon) && !isSaving;

  function resetDraft() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setIsSaving(true);

    try {
      if (editingId) {
        await editCategory({ id: editingId, name, icon });
      } else {
        await createCategory({ name, icon });
      }

      resetDraft();
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(category: BudgetCategory) {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      icon: category.icon,
    });
  }

  async function handleDelete(id: string) {
    await removeCategory(id);

    if (editingId === id) {
      resetDraft();
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      <section className="rounded-[32px] bg-slate-950 p-4 text-white shadow-[0_20px_45px_rgba(15,23,42,0.24)]">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-300">
            {editingId ? "Edit category" : "New category"}
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Keep category setup fast.
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-[96px_1fr] gap-3">
          <label className="rounded-3xl bg-white/8 p-4">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Emoji
            </span>
            <input
              type="text"
              value={draft.icon}
              onChange={(event) =>
                setDraft((current) => ({ ...current, icon: event.target.value }))
              }
              placeholder="🍔"
              maxLength={8}
              className="mt-4 w-full bg-transparent text-center text-4xl outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="rounded-3xl bg-white/8 p-4">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Name
            </span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Dining out"
              className="mt-4 w-full bg-transparent text-xl font-semibold outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className="flex-1 rounded-2xl bg-emerald-400 px-4 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSaving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Add category"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetDraft}
              className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-medium text-white"
            >
              Cancel
            </button>
          ) : null}
        </div>

        {!canSubmit && !isSaving ? (
          <p className="mt-3 text-sm text-slate-400">
            Enter both an emoji and a category name.
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Your categories
          </h2>
          <span className="text-sm text-slate-500">{categories.length} total</span>
        </div>

        {loading ? (
          <div className="mt-4 rounded-[28px] bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Loading categories...
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="rounded-[28px] bg-slate-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm">
                    {category.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-slate-900">
                      {category.name}
                    </p>
                    <p className="text-sm text-slate-500">Tap edit to update</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void moveCategory(category.id, "up")}
                    disabled={index === 0}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => void moveCategory(category.id, "down")}
                    disabled={index === categories.length - 1}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(category.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
