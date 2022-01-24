import Link from 'next/link';

const Footer = () => {
  return (
    <>
      <footer className='footer-area'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-4 col-sm-6 col-md-6'>
              <div className='single-footer-widget'>
                <a href='index.html' className='d-inline-block logo'>
                  <img src='/images/juno.png' alt='logo' style= {{ width:"100px"}}/>
                </a>
                
                <ul className='social-links'>
                  <li>
                    <a href='#' target='_blank' className='facebook'>
                      <i className='bx bxl-facebook'></i>
                    </a>
                  </li>
                  <li>
                    <a href='#' target='_blank' className='twitter'>
                      <i className='bx bxl-twitter'></i>
                    </a>
                  </li>
                  <li>
                    <a href='#' target='_blank' className='linkedin'>
                      <i className='bx bxl-linkedin'></i>
                    </a>
                  </li>
                  <li>
                    <a href='#' target='_blank' className='instagram'>
                      <i className='bx bxl-instagram'></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className='col-lg-3 col-sm-6 col-md-6'>
              <div className='single-footer-widget pl-5'>
                <h3>Steps</h3>
                <ul className='quick-links'>
                  <li>
                    <Link href='/trade'>Wallet</Link>
                  </li>
                  <li>
                    <Link href='/guides'>Create</Link>
                  </li>
                  <li>
                    <Link href='/wallet'>Stake</Link>
                  </li>
                  <li>
                    <Link href='/faq'>FAQ</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='col-lg-3 col-sm-6 col-md-6'>
              <div className='single-footer-widget'>
                <h3>Contact Info</h3>
                <ul className='footer-contact-info'>
                  <li>Graz, Austria</li>
                  <li>
                    Email: <a href='mailto:hello@Novis.com'>simonrose@gamil.com</a>
                  </li>
                  <li>
                    Phone: <a href='tel:+44587154756'>+1234-567-8901</a>
                  </li>
                  <li>
                    Fax: <a href='tel:+44587154756'>+1234-567-8901</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='copyright-area'>
          <div className='container'>
            <p>
              Copyright 2022 <strong>DoodleWorkshop</strong>. All Rights Reserved by{' '}
              <Link href='#'>
                <a target='_blank'>Achilles</a>
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
