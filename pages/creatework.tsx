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
  defaultFee
} 
from '../cosmwasm/util/const'
import {
  convertMicroDenomToDenom, 
  convertDenomToMicroDenom,
  convertFromMicroDenom
} from '../cosmwasm/util/conversion'
import { fromBase64, toBase64 } from '@cosmjs/encoding'


const CreateWork = () => {


  const [workTitle, setWorkTitle] = useState('')
  const [workDesc, setWorkDesc] = useState('')
  const [workUrl, setWorkUrl] = useState('')
  const [rateClient, setRateClient] = useState(10)
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [stakeAmount, setStakeAmount] = useState(0)
  const [clientStakeAmount, setClientStakeAmount] = useState(0)

  
  const [balance, setBalance] = useState('')
  const [cw20Balance, setCw20Balance] = useState(0)
  const [walletAmount, setWalletAmount] = useState(0)
  const [executing, setExecuting] = useState(false)

  const { walletAddress, connectWallet, signingClient, disconnect, loading } = useSigningClient()

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
      setCw20Balance(parseInt(response.balance) / 1000)
    }).catch((error) => {
      NotificationManager.error(`GetCrewBalance Error : ${error.message}`)
    })

    signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
      constants: {},
    }).then((response) => {
      console.log(response)
      setRateClient(response.rate_client)

    }).catch((error) => {
      NotificationManager.error(`GetConstants error : ${error.message}`)  
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

    // "end_time": "${end_time}" \
    let plainMsg:string = 
      `{ \
        "create" : { \
          "title":"${workTitle}", \
          "desc": "${workDesc}", \
          "url": "${workUrl}", \
          "start_time": ${start_time} \
        } \
      }`
    console.log(plainMsg)
    let uint8array:Uint8Array = new TextEncoder().encode(plainMsg);
    let encodedMsg:string = toBase64(uint8array)

    signingClient?.execute(
      walletAddress, // sender address
      PUBLIC_CW20_CONTRACT, // token escrow contract
      { 
        "send":
        {
          "contract":PUBLIC_TOKEN_ESCROW_CONTRACT, 
          "amount":(clientStakeAmount*1000).toString(), 
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
                    Juno : {walletAmount} <br/>
                    Crew : {cw20Balance} <br/>
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

                {/* <div className="flex flex-col justify-center m-4">
                  <h1 className="text-3xl font-bold justify-center mb-4">
                    Start DateTime
                  </h1>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      className="max-w-full text-2xl"
                      renderInput={(params) => <TextField {...params} />}
                      value={startDate}
                      onChange={(newValue) => {
                        setStartDate(newValue)
                      }}
                      minDateTime={startDate}
                    />
                  </LocalizationProvider>
                </div> */}

                <div className='currency-selection'>
                  <span>Stake Amount for your Work(CREW)</span>
                  <TextField fullWidth type="number" 
                    variant="standard" 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min:10, max:1000 }} 
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  />
                </div>
                
                <div className='currency-selection'>
                  <span>Client Stake Amount : ${clientStakeAmount}</span>
                  
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
