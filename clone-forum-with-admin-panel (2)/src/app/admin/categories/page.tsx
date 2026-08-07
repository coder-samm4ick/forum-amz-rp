"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORY_ICONS, ICON_KEYS, IconDown, IconUp } from "@/components/Icons";
import { toast } from "@/components/Toasts";
import { adminFetch, DangerConfirm, PanelTitle } from "../kit";

type CatRow = {
  category: { id: number; name: string; description: string; icon: string; sortOrder: number };
  topicCount: number;
};

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<CatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcon, setEditIcon] = useState("folder");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("folder");

  const load = useCallback(async () => {
    const d = await adminFetch("/api/admin/categories");
    setCats(d.categories);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function move(id: number, direction: "up" | "down") {
    try {
      await adminFetch("/api/admin/categories", { method: "PATCH", body: JSON.stringify({ id, direction }) });
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "err");
    }
  }

  async function saveEdit(id: number) {
    try {
      await adminFetch("/api/admin/categories", {
        method: "PATCH",
        body: JSON.stringify({ id, name: editName, description: editDesc, icon: editIcon }),
      });
      toast("Раздел обновлён");
      setEditingId(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "err");
    }
  }

  async function remove(id: number) {
    await adminFetch("/api/admin/categories", { method: "DELETE", body: JSON.stringify({ id }) });
    toast("Раздел удалён вместе с темами");
    await load();
  }

  async function create() {
    try {
      await adminFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: newName, description: newDesc, icon: newIcon }),
      });
      toast("Раздел создан");
      setNewName("");
      setNewDesc("");
      setNewIcon("folder");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ошибка", "err");
    }
  }

  return (
    <div className="space-y-6 rise-in">
      <PanelTitle>РАЗДЕЛЫ ФОРУМА</PanelTitle>

      {/* новый раздел */}
      <div className="card p-5">
        <h2 className="font-display text-sm tracking-wide text-ink-200 mb-4">СОЗДАТЬ РАЗДЕЛ</h2>
        <div className="grid md:grid-cols-[1fr_1.4fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Название</label>
            <input className="field" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} placeholder="Например: Ивенты" />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-wider font-bold text-ink-400 mb-2">Описание</label>
            <input className="field" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={200} placeholder="Короткое описание для доски" />
          </div>
          <div className="flex gap-2 items-end">
            <select className="field !w-32" value={newIcon} onChange={(e) => setNewIcon(e.target.value)}>
              {ICON_KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <button onClick={create} className="btn btn-primary">Создать</button>
          </div>
        </div>
      </div>

      {/* список */}
      {loading ? (
        <div className="card p-6 text-ink-400 animate-pulse">Загрузка…</div>
      ) : (
        <div className="space-y-3">
          {cats.map((row, idx) => {
            const c = row.category;
            const Icon = CATEGORY_ICONS[c.icon] ?? CATEGORY_ICONS.folder;
            const editing = editingId === c.id;
            return (
              <div key={c.id} className="card p-4">
                {editing ? (
                  <div className="grid md:grid-cols-[1fr_1.4fr_auto] gap-3 items-end">
                    <input className="field" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={60} />
                    <input className="field" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} maxLength={200} />
                    <div className="flex gap-2 items-center">
                      <select className="field !w-32" value={editIcon} onChange={(e) => setEditIcon(e.target.value)}>
                        {ICON_KEYS.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <button onClick={() => saveEdit(c.id)} className="btn btn-primary !px-4">Ок</button>
                      <button onClick={() => setEditingId(null)} className="btn btn-ghost !px-4">✕</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-ember-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[15px] tracking-wide text-ink-100">
                        <span className="text-ink-400 mr-2">{idx + 1}.</span>{c.name}
                      </div>
                      <div className="text-[13px] text-ink-400 mt-0.5">{c.description || "без описания"} · тем: {row.topicCount}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => move(c.id, "up")} disabled={idx === 0} className="btn btn-ghost !p-2 disabled:opacity-30" aria-label="Выше">
                        <IconUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => move(c.id, "down")} disabled={idx === cats.length - 1} className="btn btn-ghost !p-2 disabled:opacity-30" aria-label="Ниже">
                        <IconDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                          setEditDesc(c.description);
                          setEditIcon(c.icon);
                        }}
                        className="btn btn-ghost !px-3 !py-1.5 !text-[12px]"
                      >
                        Изменить
                      </button>
                      <DangerConfirm small onConfirm={() => remove(c.id)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
