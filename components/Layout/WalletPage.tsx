import type { NextPage } from 'next'
import { useSigningClient } from '../../cosmwasm/cosmwasmcontext'
import { useEffect, useState, MouseEvent, ChangeEvent } from 'react'
import {
  convertMicroDenomToDenom, 
  convertDenomToMicroDenom,
  convertFromMicroDenom
} from '../../cosmwasm/conversion'
import {NotificationContainer, NotificationManager} from 'react-notifications';

import TextField from '@mui/material/TextField'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import DateTimePicker from '@mui/lab/DateTimePicker'
import { fromBase64, toBase64 } from '@cosmjs/encoding'

import { encode } from 'punycode'

const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || 'ujuno'
const PUBLIC_TOKEN_ESCROW_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_ESCROW_CONTRACT || ''
const PUBLIC_CW20_CONTRACT = process.env.NEXT_PUBLIC_CW20_CONTRACT || ''

const Wallet = () => {
  const { walletAddress, signingClient, connectWallet } = useSigningClient()
  const [balance, setBalance] = useState('')
  const [cw20Balance, setCw20Balance] = useState('')
  const [walletAmount, setWalletAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '' })
  const [stakeAmount, setStakeAmount] = useState<any>('')
  const [numToken, setNumToken] = useState(0)
  const [showNumToken, setShowNumToken] = useState(false)
  const alert = useAlert()

  const [escrowExist, setEscrowExist] = useState(false)
  const [buttonEnabled, setButtonEnabled] = useState(true)


  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())


  const defaultFee = {
    amount: [],
    gas: "400000",
  };
  //=====================================================================================
  //Get Balances on Connect wallet
  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) return

    // Gets native balance (i.e. Juno balance)
    signingClient.getBalance(walletAddress, PUBLIC_STAKING_DENOM).then((response: any) => {
      const { amount, denom }: { amount: number; denom: string } = response
      setBalance(`${convertMicroDenomToDenom(amount)} ${convertFromMicroDenom(denom)}`)
      setWalletAmount(convertMicroDenomToDenom(amount))
    }).catch((error) => {
      alert.error(`Error! ${error.message}`)
      console.log('Error signingClient.getBalance(): ', error)
    })

    // Gets cw20 balance
    signingClient.queryContractSmart(PUBLIC_CW20_CONTRACT, {
      balance: { address: walletAddress },
    }).then((response) => {
      let bal = parseInt(response.balance) / 1000
      console.log("CW20 balance : " + bal)
      setCw20Balance(bal.toString())
    }).catch((error) => {
      alert.error(`Error! ${error.message}`)
      console.log('Error signingClient.queryContractSmart() balance: ', error)
    })

    //Check if this user is staked, then set the endTime and disable all buttons
    signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
      details: { id: walletAddress },
    }).then((response) => {
      console.log(response)
      //alert.info(`Info! Your escrow already exists. It ends on ${new Date(response.end_time).toString()}`)
      setEscrowExist(true)
      setEndDate(new Date(response.end_time * 1000))
      setStakeAmount(response.cw20_balance[0].amount / 1000)
      // console.log(response.end_time)
      // console.log(new Date().getTime())
      // console.log(response.end_time < (new Date().getTime()))
      setButtonEnabled(response.end_time < (new Date().getTime()) / 1000)

    }).catch((error) => {
      //No escrow exists
      setEscrowExist(false)
      setButtonEnabled(true)
      console.log('No escrow exists.')
    })
  }, [signingClient, walletAddress, alert, escrowExist])

  //=====================================================================================
  //Get Token Info
  useEffect(() => {
    if (!signingClient) return
    // Gets token information
    signingClient.queryContractSmart(PUBLIC_CW20_CONTRACT, {
      token_info: {},
    }).then((response) => {
      setTokenInfo(response)
    }).catch((error) => {
      alert.error(`Error! ${error.message}`)
      console.log('Error signingClient.queryContractSmart() token_info: ', error)
    })
  }, [signingClient, alert])

  
  //=====================================================================================
  //Update Stakeamount
   useEffect(() => {
    if (!signingClient) return

    setShowNumToken(!!stakeAmount)
    setNumToken(stakeAmount)
  }, [stakeAmount, signingClient, alert])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = event
    setStakeAmount(value)
  }

  const handleStake = (event: MouseEvent<HTMLElement>) => {
    if (!signingClient || walletAddress.length === 0) return
    if (!stakeAmount) {
      setStakeAmount("0")
      // alert.error('Please enter the amount you would like to stake')
      // return
    }
    if (parseFloat(stakeAmount) > parseFloat(cw20Balance)) {
      alert.error(`You do not have enough tokens to make this stake, maximum you can spend is ${cw20Balance}`)
      return
    }

    event.preventDefault()
    setLoading(true)

    // let end_time:number
    let end_time = 0
    if (endDate != undefined) {
      end_time = Math.floor(endDate?.getTime() / 1000)
    }
    console.log(end_time)

    // "end_time": "${end_time}" \
    let plainMsg:string = 
      `{ \
        "create" : { \
          "id":"${walletAddress}", \
          "recipient": "${walletAddress}", \
          "end_time": ${end_time} \
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
          "amount":(stakeAmount*1000).toString(), 
          "msg": encodedMsg
        } 
      }, // msg
      defaultFee,
      undefined,
      []
    ).then((response) => {
      setLoading(false)
      setEscrowExist(true)
      alert.success('Successfully staked!')
    }).catch((error) => {
      setLoading(false)
      alert.error(`Error! ${error.message}`)
      console.log(error.message)
      console.log('Error signingClient?.execute(): ', error)
    })
    
  }
  
  const handleRefund = (event: MouseEvent<HTMLElement>) => {
    if (!signingClient || walletAddress.length === 0) return
    if (!escrowExist) return

    event.preventDefault()
    setLoading(true)

    signingClient?.execute(
      walletAddress, // sender address
      PUBLIC_TOKEN_ESCROW_CONTRACT, // token escrow contract
      { 
        "refund":
        {
          "id":walletAddress, 
        } 
      }, // msg
      defaultFee,
      undefined,
      []
    ).then((response) => {
      setStakeAmount('')
      setLoading(false)
      setEscrowExist(false)
      alert.success('Successfully refunded!')
    }).catch((error) => {
      setLoading(false)
      alert.error("Cannot refund yet.")
      // alert.error(`Error! ${error.message}`)
      console.log(error.message)
      console.log('Error signingClient?.execute(): ', error)
    })
    
  }

  const handleButton =  (event: MouseEvent<HTMLElement>) => {
    if (escrowExist)
      handleRefund(event)
    else
      handleStake(event)
  }


  return (
    <WalletLoader loading={loading}>

      <div id="timediv" className="flex flex-row justify-center mr-12 ml-12 mb-20">
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
                setStartDate(newValue);
              }}
              minDateTime={new Date()}
              disabled={escrowExist}
              
            />
          </LocalizationProvider>
        </div> */}

        <div className="flex flex-col justify-center m-4">
          <h1 className="text-3xl font-bold justify-center mb-4">
            End DateTime
          </h1>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              className="max-w-full text-2xl"
              renderInput={(params) => <TextField {...params} />}
              value={endDate}
              onChange={(newValue) => {
                setEndDate(newValue)
              }}
              minDateTime={startDate}
              disabled={escrowExist}
            />
          </LocalizationProvider>
        </div>
      </div>
      {balance && (
        <p className="text-primary text-2xl">
          <span>{`Your wallet has ${balance} `}</span>
        </p>
      )}

      {cw20Balance && (
        <p className="mt-2 text-primary text-2xl">
          <span>{`and ${cw20Balance} ${tokenInfo.symbol} `}</span>
        </p>
      )}

      <h1 className="mt-4 mb-10 text-5xl font-bold">
        <span>{` ${tokenInfo.name} `}</span>
      </h1>

      <div className="form-control">
        <div className="relative">
          <input
            type="number"
            id="purchase-amount"
            placeholder="Amount"
            step="0.1"
            className="w-full input input-lg input-primary input-bordered font-mono text-2xl"
            onChange={handleChange}
            value={stakeAmount}
            disabled={escrowExist}
            style={{ paddingRight: '10rem' }}
          /> 
          <button
            className="absolute top-0 right-0 rounded-l-none btn btn-lg btn-primary text-2xl"
            onClick={handleButton}
          >
            { escrowExist ? "Refund" : "Stake" }
          </button>
        </div>
      </div>

      {showNumToken && (
        <div className="mt-8">
          <h2 className="text-3xl mt-3 text-secondary">
            { escrowExist ? "You staked and can refund after " + endDate?.toLocaleString(): "You are staking" }
          </h2>
          <h1 className="text-3xl mt-3 text-primary">
            <span>{`${numToken} ${tokenInfo.symbol} `}</span>
          </h1>
        </div>
      )}
    </WalletLoader>
  )
}

export default Wallet
