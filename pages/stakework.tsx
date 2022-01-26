import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import ReactPaginate from 'react-paginate';
const ascen = '../images/sort_asc.png';
const descen = '../images/sort_desc.png';

const StakeWork = () => {
  const [newData, setnewData] = useState([]);

  //search
  const [q, setQ] = useState('');
  //selec value
  const [value, setValue] = useState(10);

  //paginate
  const [pageNumber, setpageNumber] = useState(0);
  const coinsPerPage = 20;
  const pagesVisited = pageNumber * coinsPerPage;
  const pageCount = Math.ceil(newData.length / coinsPerPage);
  const changePage = ({ selected }) => {
    setpageNumber(selected);
  };

  useEffect(() => {
    const getCoins = async () => {
      const { data } = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
      );

      setnewData(data);
    };
    getCoins();
  }, []);

  const search = (rows) => {
    return rows.filter((row) => row.name.toLowerCase().indexOf(q) > -1);
  };

  return (
    <>
      <div className='market-health-area pt-100 pb-70'>
        <div className='container'>
          <div className='section-title'>
            <h2>
              Work List
            </h2>
          </div>
          
        </div>
      </div>
      <div className='container pb-70'>
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
                  <th scope='col'>Name</th>
                  <th scope='col'>Desc</th>
                  <th scope='col'>Create Time</th>
                  <th scope='col'>Minimum Stake Token</th>
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
                        <td>
                          <div className='d-flex align-items-center crypto-image'>
                            <img src={data.image} alt='image' />
                            <h3 className='mb-0 crypto-name'>{data.name}</h3>
                          </div>
                        </td>
                        <td>USD {data.current_price}</td>
                        <td>
                          {data.price_change_percentage_24h < 0 ? (
                            <span className='trending down'>
                              <i className='fas fa-caret-down'></i> -
                              {data.price_change_percentage_24h.toFixed(2)}%
                            </span>
                          ) : (
                            <span className='trending up'>
                              <i className='fas fa-caret-up'></i> +
                              {data.price_change_percentage_24h.toFixed(2)}%
                            </span>
                          )}
                        </td>
                        <td>${data.total_volume}</td>
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
                Showing 1 to 20 of {newData.length} entries
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
