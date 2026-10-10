export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-400">
          Local-first writing review
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          DraftLocal
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
          Review content and README files without sending your draft to a cloud
          AI service.
        </p>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex gap-3">
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
              Content Review
            </button>

            <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300">
              README Review
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Article title
              </label>

              <input
                type="text"
                placeholder="Enter your article title"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Target keyword
              </label>

              <input
                type="text"
                placeholder="Enter your target keyword"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Content
              </label>

              <textarea
                rows={12}
                placeholder="Paste your draft here..."
                className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <button className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black">
              Analyze locally
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
          <strong className="text-zinc-200">Local processing:</strong> DraftLocal
          is being designed so its core review features can run on your device.
        </div>
      </div>
    </main>
  );
}