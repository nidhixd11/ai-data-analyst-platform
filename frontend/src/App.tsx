import Layout from "./components/Layout";

function App() {
  return (
    <Layout>
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Data Insights Chatbot
          </h1>
          <p className="mt-3 text-base text-[var(--color-text-muted)]">
            Upload a CSV or Excel file to get started.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default App;
