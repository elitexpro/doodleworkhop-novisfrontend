import { useEffect, useState, MouseEvent, ChangeEvent } from 'react'
import TextField from '@mui/material/TextField';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import { useSigningClient } from '../cosmwasm/contexts/cosmwasm'
import { 
  PUBLIC_STAKING_DENOM,
  PUBLIC_TOKEN_ESCROW_CONTRACT,
  PUBLIC_CW20_CONTRACT,
  defaultFee
} 
from '../cosmwasm/util/const'
import { fromBase64, toBase64 } from '@cosmjs/encoding'

const Admin = () => {


  const [managerAddr, setManagerAddr] = useState('')
  const [minStake, setMinStake] = useState(10)
  const [rateClient, setRateClient] = useState(10)
  const [rateManager, setRateManager] = useState(10)

  const { walletAddress, connectWallet, signingClient, disconnect, loading } = useSigningClient()

  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) return

    signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
      constants: {},
    }).then((response) => {
      console.log(response)
      setManagerAddr(response.manager_addr)
      setMinStake(response.min_stake)
      setRateClient(response.rate_client)
      setRateManager(response.rate_manager)

    }).catch((error) => {
      NotificationManager.error('GetConstants query failed')  
    })
  }, [loading, ])

  const handleSubmit = (event: MouseEvent<HTMLElement>) => {
    if (!signingClient || walletAddress.length === 0) {
      NotificationManager.error('Please connect wallet first')  
      return
    }
    
    if (managerAddr == '') {
      NotificationManager.error('Please input manager address')  
      return
    }
    signingClient?.execute(
      walletAddress, // sender address
      PUBLIC_TOKEN_ESCROW_CONTRACT, // token escrow contract
      { 
        "set_constant":
        {
          "manager_addr":`${managerAddr}`, 
          "min_stake":`${minStake}`, 
          "rate_client": `${rateClient}`,
          "rate_manager": `${rateManager}`
        } 
      }, // msg
      defaultFee,
      undefined,
      []
    ).then((response) => {
      NotificationManager.success('Successfully changed')
    }).catch((error) => {
      NotificationManager.error(`SetConstant error : ${error.message}`)
    })
    
  }




  return (
    <>
      <div className='trade-cryptocurrency-area ptb-100'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-4 col-md-12'>
              <div className='trade-cryptocurrency-content'>
                <h1>
                  <span>Administration</span>
                </h1>
                <p>
                  Set manager parameters.
                </p>
                
              </div>
            </div>
            <div className='col-lg-8 col-md-12'>
              <div className='trade-cryptocurrency-box'>
                <div className='currency-selection'>
                <span>Manager address to Chanage</span>
                  <TextField fullWidth id="standard-basic"  variant="standard" 
                  value={managerAddr}
                  error={managerAddr==''}
                  onChange={(e) => setManagerAddr(e.target.value)}
                  />
                </div>

                <div className='currency-selection'>
                  <span>Minimum Stake Amount for One Work(CREW)</span>
                  <TextField fullWidth type="number" 
                    variant="standard" 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min:10, max:1000 }} 
                  value={minStake}
                  onChange={(e) => setMinStake(Number(e.target.value))}
                  />
                </div>
                
                <div className='currency-selection'>
                  <span>Client Stake Rate for One Work(%)</span>
                  <TextField fullWidth type="number" 
                    variant="standard" 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min:1, max:30 }} 
                  value={rateClient}
                  onChange={(e) => setRateClient(Number(e.target.value))}
                  />
                </div>

                <div className='currency-selection'>
                  <span>Manager Earn Rate for Work(%)</span>
                  <TextField fullWidth type="number" 
                    variant="standard" 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min:1, max:30 }} 
                  value={rateManager}
                  onChange={(e) => setRateManager(Number(e.target.value))}
                  />
                </div>

                <button type='submit'
                onClick={handleSubmit}
                >
                  <i className='bx bxs-hand-right'></i> Set Manager Params
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='lines'>
          <div className='line'></div>
          <div className='line'></div>
          <div className='line'></div>
          <div className='line'></div>
          <div className='line'></div>
        </div>
      </div>
    </>
  );
};

export default Admin;
