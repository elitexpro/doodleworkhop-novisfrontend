import { useEffect, useState, MouseEvent, ChangeEvent } from 'react'
import TextField from '@mui/material/TextField'
import {NotificationContainer, NotificationManager} from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'

import { useSigningClient } from '../cosmwasm/contexts/cosmwasm'
import { 
  PUBLIC_STAKING_DENOM,
  PUBLIC_TOKEN_ESCROW_CONTRACT,
  PUBLIC_CW20_CONTRACT,
  defaultFee,
  CW20_DECIMAL
} 
from '../cosmwasm/util/const'
import {
  convertMicroDenomToDenom, 
  convertDenomToMicroDenom,
  convertFromMicroDenom
} from '../cosmwasm/util/conversion'
import { fromBase64, toBase64 } from '@cosmjs/encoding'


const CreateWork = () => {


  //Work Variables
  const [workTitle, setWorkTitle] = useState('')
  const [workDesc, setWorkDesc] = useState('')
  const [workUrl, setWorkUrl] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [stakeAmount, setStakeAmount] = useState(0)
  const [accountMinStakeAmount, setAccountMinStakeAmount] = useState(0)
  const [clientStakeAmount, setClientStakeAmount] = useState(0)

  
  //Balance variables
  const [balance, setBalance] = useState('')
  const [cw20Balance, setCw20Balance] = useState(0)
  const [walletAmount, setWalletAmount] = useState(0)
  const [executing, setExecuting] = useState(false)

  //Global Variables
  const [managerAddr, setManagerAddr] = useState('')
  const [minStake, setMinStake] = useState(10)
  const [rateClient, setRateClient] = useState(10)
  const [rateManager, setRateManager] = useState(10)

  const { walletAddress, connectWallet, signingClient, disconnect, loading } = useSigningClient()


  //Get Admin parameters
  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) return

    signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
      constants: {},
    }).then((response) => {
      setManagerAddr(response.manager_addr)
      setMinStake(response.min_stake)
      setRateClient(response.rate_client)
      setRateManager(response.rate_manager)

      setStakeAmount(response.min_stake)
    }).catch((error) => {
      NotificationManager.error('GetConstants query failed')  
    })
  }, [walletAddress])

  //Get Balances on Connect wallet
  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) return

    // Gets native balance (i.e. Juno balance)
    signingClient.getBalance(walletAddress, PUBLIC_STAKING_DENOM).then((response: any) => {
      const { amount, denom }: { amount: number; denom: string } = response
      setBalance(`${convertMicroDenomToDenom(amount)} ${convertFromMicroDenom(denom)}`)
      setWalletAmount(convertMicroDenomToDenom(amount))
    }).catch((error) => {
      NotificationManager.error(`GetBalance Error : ${error.message}`)
    })

    // Gets cw20 balance
    signingClient.queryContractSmart(PUBLIC_CW20_CONTRACT, {
      balance: { address: walletAddress },
    }).then((response) => {
      setCw20Balance(parseInt(response.balance) / CW20_DECIMAL)
    }).catch((error) => {
      NotificationManager.error(`GetCrewBalance Error : ${error.message}`)
    })
    
  }, [loading, executing])

  useEffect(() => {
    setClientStakeAmount(stakeAmount * rateClient / 100.0)
  }, [stakeAmount])


  const handleSubmit = (event: MouseEvent<HTMLElement>) => {
    if (!signingClient || walletAddress.length === 0) {
      NotificationManager.error('Please connect wallet first')  
      return
    }
    
    if (workTitle == "" || workDesc == "" || workUrl=="") {
      NotificationManager.error('Please input all iields')  
      return
    }
    if (clientStakeAmount > cw20Balance) {
      NotificationManager.error(`You do not have enough tokens to make work, maximum you can spend is ${cw20Balance}, but requires ${clientStakeAmount}`)
      return
    }
    setExecuting(true)
    event.preventDefault()
    // let end_time:number
    let start_time = 0
    if (startDate != undefined) {
      start_time = Math.floor(startDate?.getTime() / 1000)
    }
    console.log(start_time)

    let workId:string = toBase64(new TextEncoder().encode(walletAddress+"_"+workTitle))

    let plainMsg:string = 
      `{ \
        "create" : { \
          "id": "${workId}", \
          "client" : "${walletAddress}", \
          "work_title":"${workTitle}", \
          "work_desc": "${workDesc}", \
          "work_url": "${workUrl}", \
          "start_time": ${start_time}, \
          "account_min_stake_amount": ${accountMinStakeAmount*CW20_DECIMAL}, \
          "stake_amount": ${stakeAmount*CW20_DECIMAL} \
        } \
      }`
    console.log(plainMsg)
 
    let encodedMsg:string = toBase64(new TextEncoder().encode(plainMsg))

    signingClient?.execute(
      walletAddress, // sender address
      PUBLIC_CW20_CONTRACT, // token escrow contract
      { 
        "send":
        {
          "contract":PUBLIC_TOKEN_ESCROW_CONTRACT, 
          "amount":(clientStakeAmount*CW20_DECIMAL).toString(), 
          "msg": encodedMsg
        } 
      }, // msg
      defaultFee,
      undefined,
      []
    ).then((response) => {
      NotificationManager.success('Successfully created')
      setExecuting(false)
    }).catch((error) => {
      NotificationManager.error(`Create Work Error: ${error.message}`)
      setExecuting(false)
      console.log(error)
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
                  <span>Create Work</span>
                </h1>
                <p>
                  <h3 style={{ "color":"white" }}>Your Balance</h3>
                  <br/>
                  <h4 style={{ "color":"white" }}>
                    {walletAmount} JUNO <br/>
                    {cw20Balance} CREW <br/>
                  </h4>

                </p>
                
              </div>
            </div>
            <div className='col-lg-8 col-md-12'>
              <div className='trade-cryptocurrency-box'>
                <div className='currency-selection'>
                <span>Work Title</span>
                  <TextField fullWidth id="standard-basic"  variant="standard" 
                  value={workTitle}
                  error={workTitle==''}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  />
                </div>

                <div className='currency-selection'>
                <span>Work Description</span>
                  <TextField fullWidth id="standard-basic"  variant="standard" 
                  value={workDesc}
                  error={workDesc==''}
                  onChange={(e) => setWorkDesc(e.target.value)}
                  />
                </div>

                <div className='currency-selection'>
                <span>Work URL</span>
                  <TextField fullWidth id="standard-basic"  variant="standard" 
                  value={workUrl}
                  error={workUrl==''}
                  onChange={(e) => setWorkUrl(e.target.value)}
                  />
                </div>

                <div className="currency-selection row">
                <span className="flex mb-2">Start DateTime for your Work</span>
                  <LocalizationProvider dateAdapter={AdapterDateFns} className="col-md-3">
                    <DateTimePicker
                      renderInput={(params) => <TextField {...params} />}
                      value={startDate}
                      onChange={(newValue) => {
                        setStartDate(newValue)
                      }}
                      minDateTime={startDate}
                    />
                  </LocalizationProvider>
                </div>

                <div className='currency-selection'>
                  <span>Each Account's Minimun Stake Amount for your Work(CREW)</span>
                  <TextField fullWidth type="number" 
                    variant="standard" 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min:0, max: stakeAmount }} 
                    value={accountMinStakeAmount}
                    onChange={(e) => setAccountMinStakeAmount(Number(e.target.value))}
                  />
                </div>

                <div className='currency-selection'>
                  <span>Total Stake Amount for your Work(CREW)</span>
                  <TextField fullWidth type="number" 
                    variant="standard" 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min:minStake }} 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                  />
                </div>
                
                <div className='currency-selection'>
                  <span>Client's Self Stake Amount(CREW)</span>
                  <TextField fullWidth type="number" 
                    variant="standard" 
                    value={clientStakeAmount}
                    disabled={true}
                  />
                </div>


                <button type='submit'
                onClick={handleSubmit}
                >
                  <i className='bx bxs-hand-right'></i> Create Work
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

export default CreateWork;
