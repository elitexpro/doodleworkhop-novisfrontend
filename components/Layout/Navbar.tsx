import React,{useState, useEffect} from 'react';
import Link from '../../utils/ActiveLink';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import { useSigningClient } from '../../cosmwasm/contexts/cosmwasm'

const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || 'ujuno'
const PUBLIC_TOKEN_ESCROW_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_ESCROW_CONTRACT || ''
const PUBLIC_CW20_CONTRACT = process.env.NEXT_PUBLIC_CW20_CONTRACT || ''

const Navbar = () => {
  const [showMenu, setshowMenu] = useState(false);
  const toggleMenu = () => {
    setshowMenu(!showMenu)
  };

  const { walletAddress, connectWallet, signingClient, disconnect, loading } = useSigningClient()
  const [isadmin, setIsadmin] = useState(false)

  const handleConnect = () => {
    if (walletAddress.length === 0) {
      connectWallet().then((response) => {
        NotificationManager.success('Successfully Connected', 'Connection', 1000)  
      }).catch((error) => {
        NotificationManager.error('Connection Failed', 'Connection', 3000)  
      })
    } else {
      disconnect()
      NotificationManager.info('Successfully Disconnected', 'Connection', 3000)
    }
  }

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) return

    //Check if this user is admin
    signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
      isadmin: {},
    }).then((response) => {
      console.log(response)
      setIsadmin(response.isadmin)

    }).catch((error) => {
      NotificationManager.error('iadmin Query Failed', 'Query', 3000)  
    })
  }, [signingClient, walletAddress])

  useEffect(() => {
    let elementId = document.getElementById('navbar');
    document.addEventListener('scroll', () => {
      if (window.scrollY > 170) {
        elementId.classList.add('is-sticky');
      } else {
        elementId.classList.remove('is-sticky');
      }
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <NotificationContainer/>
      <div  id='navbar' className='navbar-area'>
        <div className='raimo-responsive-nav'>
          <div className='container'>
            <div className='raimo-responsive-menu'>
              <div onClick={() => toggleMenu()} className='hamburger-menu'>
                {showMenu ? (
                  <i className='bx bx-x'></i>
                ) : (
                  <i className='bx bx-menu'></i>
                )}
              </div>
              <div className='logo'>
                <Link href='/'>
                  <a>
                    <img src='/images/juno.png' alt='logo' />
                  </a>
                </Link>
              </div>


              <div className='responsive-others-option'>
                <div className='d-flex align-items-center'>
                  <div className='option-item'>
                    <Link href='/authentication' activeClassName='active'>
                      <a className='login-btn'>
                        <i className='bx bx-log-in'></i>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className={showMenu? 'show navbar navbar-expand-md navbar-light':'navbar navbar-expand-md navbar-light hide-menu'}>
          <div className='container'>
            <Link className="flex" href='/'>
              <div className="d-flex flex-row align-items-center" >
                <a className="justify-content-center" style= {{ width:"40px"}}>
                  <img src='/images/juno.png' alt='logo' className="justify-right"/>
                </a>
                <h3 className="text-3xl font-bold justify-center mt-2 ms-2">
                  DOODLE WORKSHOP
                </h3>
              </div>
            </Link>

            <div className='collapse navbar-collapse mean-menu'>
              
              <ul className='navbar-nav'>
                {walletAddress.length==0 || isadmin ? <></>:
                  <li className='nav-item'>
                    <Link href='#' activeClassName='active'>
                      <a className='dropdown-toggle nav-link'>Admin</a>
                    </Link>
                    <ul className='dropdown-menu'>
                      <li className='nav-item'>
                        <Link href='/admin' activeClassName='active'>
                          <a className='nav-link'>Work List</a>
                        </Link>
                      </li>
                    </ul>
                  </li>
                }
                {walletAddress.length==0 ? <></>:
                  <li className='nav-item megamenu'>
                    <Link href='#' activeClassName='active'>
                      <a className='dropdown-toggle nav-link'>Works</a>
                    </Link>
                    <ul className='dropdown-menu'>
                      <li className='nav-item'>
                        <Link href='/work'>
                          <a className='nav-link'>
                            <img
                              src='/images/cryptocurrency/cryptocurrency2.png'
                              alt='image'
                            />
                            Create Work
                          </a>
                        </Link>
                      </li>
                      <li className='nav-item'>
                        <Link href='/stake'>
                          <a className='nav-link'>
                            <img
                              src='/images/cryptocurrency/cryptocurrency3.png'
                              alt='image'
                            />
                            Stake Work
                          </a>
                        </Link>
                      </li>
                    </ul>
                  </li>
                }
                <li className='nav-item megamenu support'>
                  <Link href='/faq' activeClassName='active'>
                    <a className='dropdown-toggle nav-link'>Support</a>
                  </Link>
                  <ul className='dropdown-menu'>
                    <li className='nav-item'>
                      <Link href='/faq' activeClassName='active'>
                        <a className='nav-link'>
                          <i className='bx bx-info-circle'></i>
                          FAQ
                        </a>
                      </Link>
                    </li>
                    <li className='nav-item'>
                      <Link href='/guides' activeClassName='active'>
                        <a className='nav-link'>
                          <i className='bx bx-book'></i>
                          Guides
                        </a>
                      </Link>
                    </li>
                    <li className='nav-item'>
                      <Link href='/wallet' activeClassName='active'>
                        <a className='nav-link'>
                          <i className='bx bx-wallet'></i>
                          Wallets
                        </a>
                      </Link>
                    </li>
                    <li className='nav-item'>
                      <Link href='/about' activeClassName='active'>
                        <a className='nav-link'>
                          <i className='bx bx-group'></i>
                          About Us
                        </a>
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
              <div className='others-option'>
                <div className='d-flex align-items-center'>
                  <i className= { loading ? 'bx bx-loader bx-spin bx-md' : '' }></i> 
                  <div className="flex flex-grow lg:flex-grow-0 max-w-full ms-2">
                    <button
                      className="block default-btn w-full max-w-full truncate"
                      onClick={handleConnect}
                    >
                      <i className= 'bx bxs-contact'></i> 
                      {walletAddress || 'Connect Wallet'}
                    </button>
                  </div>
                  <div className='option-item'>
                    {walletAddress.length == 0 ? 
                    <Link href='https://keplr.app/' activeClassName='active'>
                      <a className='login-btn'>
                        <i className='bx bxs-error'></i> no Keplr?
                      </a>
                    </Link>:<></>
                    }
                  </div>

                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
