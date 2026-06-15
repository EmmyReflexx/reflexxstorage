import { Link } from 'react-router-dom';
import Header from '../../components/headers/Header';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Reflexx | Secure File Vault System</title>
        <meta name="description" content="Cyberpunk-themed file management system with encrypted vault storage" />
      </Helmet>
      
      <main>
        <div>
          <Header />
        </div>

        {/* Navigation Gateway Cards */}
        <div className="flex h-[80vh] items-center justify-center gap-5">
          <Link to="/vault">
            <div className="home-card">
              <h3>Vault</h3>
            </div>
          </Link>

          <Link to="/file-explorer">
            <div className="home-card">
              <h3>Global Store</h3>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
