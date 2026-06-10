import Layout from "./components/Layout";
import UploadZone from "./features/upload/UploadZone";

function App() {
  return (
    <Layout>
      <div className="flex h-full items-center justify-center py-12">
        <UploadZone />
      </div>
    </Layout>
  );
}

export default App;
