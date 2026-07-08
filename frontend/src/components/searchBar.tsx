export default function SearchBar() {
  return (
    <section className="mx-auto mt-16 max-w-5xl px-8">
      <div className="rounded-2xl border border-gray-800 bg-[#15151f] p-5">
        <input
          type="text"
          placeholder="Ask anything about your data..."
          className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
        />
      </div>
    </section>
  );
}