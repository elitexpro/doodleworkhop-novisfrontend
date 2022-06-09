import Head from 'next/head';
import { useRouter } from 'next/router';

//top header
import TopHeader from './TopHeader';

//navbar
import Navbar from './Navbar';

//footer
import Footer from './Footer';

const Layout = ({ children }) => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <>
      <Head>
        <title>Doodle Workshop</title>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
        <meta
          name='description'
          content='Doodle Workshop'
        />
        <meta
          name='og:title'
          property='og:title'
          content='Doodle Workshop'
        ></meta>
        <meta
          name='twitter:card'
          content='Doodle Workshop'
        ></meta>
        
      </Head>

      {/* {pathname === '/' ? <TopHeader /> : ''} */}
      <Navbar />
  
      {children}

      <Footer />
    </>
  );
};

export default Layout;
