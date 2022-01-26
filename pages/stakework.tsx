import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import ReactPaginate from 'react-paginate';
const ascen = '../images/sort_asc.png';
const descen = '../images/sort_desc.png';
import {NotificationContainer, NotificationManager} from 'react-notifications'
import moment from 'moment'
import { useSigningClient } from '../contexts/cosmwasm'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { CW20_DECIMAL } from '../hooks/cosmwasm'


const StakeWork = () => {
  const { 
    walletAddress,
    signingClient,
    loading,
    error,
    connectWallet,
    disconnect,
    client,
    getIsAdmin,
    isAdmin,

    getManagerConstants,
    setManagerConstants,
    setManagerAddr,
    setMinStake,
    setRateClient,
    setRateManager,
    managerAddr,
    minStake,
    rateClient,
    rateManager,

    getBalances,
    nativeBalanceStr,
    cw20Balance,
    nativeBalance,

    executeSendContract,
    getDetailsAll,
    detailsAll

  } = useSigningClient()

  const [newData, setnewData] = useState([]);

  //search
  const [q, setQ] = useState('');
  //selec value
  const [value, setValue] = useState(10);

  //paginate
  const [pageNumber, setpageNumber] = useState(0)
  const coinsPerPage = 20;
  const pagesVisited = pageNumber * coinsPerPage;
  const [pageCount, setPageCount] = useState(0)
  const changePage = ({ selected }) => {
    setpageNumber(selected);
  };

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) 
      return
    getDetailsAll()
  }, [signingClient, walletAddress])

  useEffect(() => {
    if (detailsAll == null || detailsAll.escrows == null)
      return
    console.log(detailsAll.escrows)
    setnewData(detailsAll.escrows)
    setPageCount(Math.ceil(detailsAll?.escrows.length / coinsPerPage))

  }, [detailsAll])

  const search = (rows) => {
    return rows.filter((row) => 
    (
      row.work_title.toLowerCase().indexOf(q.toLocaleLowerCase()) > -1 || 
      row.work_desc.toLowerCase().indexOf(q.toLocaleLowerCase()) > -1 ||
      row.work_url.toLowerCase().indexOf(q.toLocaleLowerCase()) > -1 
      ));
  };

  return (
    <>
      <div className='market-health-area pt-100 pb-10'>
        <div className='container'>
          <div className='section-title'>
            <h2>
              Work List
            </h2>
          </div>
          
        </div>
      </div>
      <div className='container pb-10'>
        <div className='row'>
          <div className='price-filter'>
            

            <div className='col-md-3'>
              Search:{' '}
              <input
                type='text'
                className='crypto-search'
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div className='cryptocurrency-table table-responsive'>
            <table className='table'>
              <thead>
                <tr>
                  <th scope='col'>Title</th>
                  <th scope='col'>Desc</th>
                  <th scope='col'>Stake Amount</th>
                  <th scope='col'>Start Time</th>
                  <th scope='col'>Url</th>
                  <th scope='col'>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* slice(0, parseInt(value)) */}
                {newData &&
                  newData.length > 0 &&
                  search(newData)
                    .slice(0 || pagesVisited, pagesVisited + coinsPerPage)
                    .map((data) => (
                      <tr key={data.id}>
                        
                        <td>{data.work_title}</td>
                        <td>{data.work_desc}</td>
                        <td>{data.stake_amount / CW20_DECIMAL}</td>
                        <td>{moment(new Date(data.start_time * 1000)).format('YYYY/MM/DD HH:mm:ss')}</td>
                        <td>{data.work_url}</td>
                        <td>
                          <Link href='https://www.coinbase.com/accounts'>
                            <a className='link-btn'>Trade</a>
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            <div className='count-pagination'>
              <p className='price-count'>
                Showing 1 to 20 of {newData?.length} entries
              </p>

              <div className='pagination'>
                <ReactPaginate
                  previousLabel={'<'}
                  nextLabel={'>'}
                  pageCount={pageCount}
                  onPageChange={changePage}
                  activeClassName='current'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StakeWork;
