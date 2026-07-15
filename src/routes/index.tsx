import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GitHub Repo Importer — Python Learner" },
      {
        name: "description",
        content:
          "Paste a GitHub repository URL to browse and preview its files inside your Lovable project.",
      },
    ],
  }),
  component: Importer,
});

type TreeEntry = {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
};

type RepoInfo = {
  owner: string;
  repo: string;
  branch: string;
};

function parseRepoUrl(input: string): RepoInfo | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    // Accept owner/repo shorthand
    if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
      const [owner, repo] = trimmed.split("/");
      return { owner, repo: repo.replace(/\.git$/, ""), branch: "" };
    }
    const url = new URL(trimmed);
    const parts = url.pathname.replace(/^\/+/, "").split("/");
    if (parts.length < 2) return null;
    const [owner, repoRaw, kind, ...rest] = parts;
    const repo = repoRaw.replace(/\.git$/, "");
    let branch = "";
    if ((kind === "tree" || kind === "blob") && rest[0]) branch = rest[0];
    return { owner, repo, branch };
  } catch {
    return null;
  }
}

async function ghJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function Importer() {
  const [url, setUrl] = useState(
    "https://github.com/05unique-dotcom/python-learner-app",
  );
  const [info, setInfo] = useState<RepoInfo | null>(null);
  const [tree, setTree] = useState<TreeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileLoading, setFileLoading] = useState(false);
  const [filter, setFilter] = useState("");

  async function handleImport() {
    setError(null);
    setTree([]);
    setSelected(null);
    setFileContent("");
    const parsed = parseRepoUrl(url);
    if (!parsed) {
      setError("Enter a valid GitHub URL or owner/repo");
      return;
    }
    setLoading(true);
    try {
      let branch = parsed.branch;
      if (!branch) {
        const repoMeta = await ghJson(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
        );
        branch = repoMeta.default_branch;
      }
      const treeData = await ghJson(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`,
      );
      const entries: TreeEntry[] = (treeData.tree ?? []).filter(
        (e: TreeEntry) => e.type === "blob",
      );
      setInfo({ ...parsed, branch });
      setTree(entries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load repo");
    } finally {
      setLoading(false);
    }
  }

  async function loadFile(path: string) {
    if (!info) return;
    setSelected(path);
    setFileLoading(true);
    setFileContent("");
    try {
      const raw = await fetch(
        `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.branch}/${path}`,
      );
      if (!raw.ok) throw new Error(`Failed to fetch file (${raw.status})`);
      const text = await raw.text();
      setFileContent(text.slice(0, 200_000));
    } catch (e) {
      setFileContent(e instanceof Error ? e.message : "Failed to load file");
    } finally {
      setFileLoading(false);
    }
  }

  const filteredTree = filter
    ? tree.filter((e) => e.path.toLowerCase().includes(filter.toLowerCase()))
    : tree;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm ring-1 ring-indigo-100 dark:bg-slate-800/70 dark:text-indigo-300 dark:ring-slate-700">
            <span>🐍</span> Placeholder integration
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            GitHub Repo Importer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Paste a public GitHub repo URL to browse its file tree and preview
            source code. Once you find files worth carrying over, copy them into
            this project and I'll wire them into your Python Learner app.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Repository URL or owner/repo
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              onClick={handleImport}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Importing…" : "Import"}
            </button>
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
          {info && !error && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Loaded <span className="font-mono">{info.owner}/{info.repo}</span>{" "}
              on branch <span className="font-mono">{info.branch}</span> ·{" "}
              {tree.length} files
            </p>
          )}
        </section>

        {tree.length > 0 && (
          <section className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter files…"
                className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <div className="max-h-[520px] overflow-auto">
                <ul className="space-y-0.5 text-sm">
                  {filteredTree.map((entry) => (
                    <li key={entry.path}>
                      <button
                        onClick={() => loadFile(entry.path)}
                        className={`w-full truncate rounded-md px-2 py-1 text-left font-mono text-xs transition ${
                          selected === entry.path
                            ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                        title={entry.path}
                      >
                        {entry.path}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 shadow-sm ring-1 ring-slate-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="truncate font-mono text-xs text-slate-400">
                  {selected ?? "Select a file to preview"}
                </span>
                {selected && (
                  <button
                    onClick={() => navigator.clipboard.writeText(fileContent)}
                    className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    Copy
                  </button>
                )}
              </div>
              <pre className="max-h-[520px] overflow-auto text-xs leading-relaxed text-slate-200">
                <code>
                  {fileLoading
                    ? "Loading…"
                    : fileContent || "// File preview will appear here."}
                </code>
              </pre>
            </div>
          </section>
        )}

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Uses GitHub's public REST API. Private repos need an access token —
          ask me to wire one up when you're ready.
        </p>
      </div>
    </div>
  );
}
