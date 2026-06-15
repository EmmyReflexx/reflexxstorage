import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Home from './pages/home/Home';
import { Vault, VaultLogin, VaultSignUp } from './pages/vault';
import { FileExplorer } from './pages/file-explorer/FileExplorer';
import { VaultExplorer } from './pages/vault/vault-explorer/VaultExplorer';
import './App.css';

function App() {
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Reflexx</title>
          <link rel="icon" type="image/svg+xml" href="./public/favicon.svg" />
        </Helmet>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/file-explorer" element={<FileExplorer />} />
            <Route
              path="/file-explorer/folder/:folderId"
              element={<FileExplorer />}
            />
            <Route path="/login" element={<VaultLogin />} />
            <Route path="/signup" element={<VaultSignUp />} />
            <Route path="/vault-explorer" element={<VaultExplorer />} />
            <Route
              path="/vault-explorer/folder/:folderId"
              element={<VaultExplorer />}
            />
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </>
  );
}

export default App;
