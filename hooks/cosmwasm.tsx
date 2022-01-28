import { useState } from 'react'
import { connectKeplr } from '../services/keplr'
import { SigningCosmWasmClient, CosmWasmClient, JsonObject } from '@cosmjs/cosmwasm-stargate'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  convertMicroDenomToDenom, 
  convertDenomToMicroDenom,
  convertFromMicroDenom
} from '../util/conversion'
import {NotificationContainer, NotificationManager} from 'react-notifications'

export interface ISigningCosmWasmClientContext {
  walletAddress: string
  client: CosmWasmClient | null
  signingClient: SigningCosmWasmClient | null
  loading: boolean
  error: any
  connectWallet: any
  disconnect: Function,

  getIsAdmin: Function,
  isAdmin: boolean,

  getManagerConstants: Function,
  setManagerConstants: Function,
  setManagerAddr: Function,
  setMinStake: Function,
  setRateClient: Function,
  setRateManager: Function,
  managerAddr: string,
  minStake: number,
  rateClient: number,
  rateManager: number,
  

  getBalances: Function,
  nativeBalanceStr: string,
  cw20Balance: number,
  nativeBalance: number,

  executeSendContract: Function,

  getDetailsAll: Function,
  detailsAll: any,

  executeApproveContract: Function,
  executeRefundContract: Function


}

export const PUBLIC_CHAIN_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || ''
export const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || ''
export const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || 'ujuno'
export const PUBLIC_TOKEN_ESCROW_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_ESCROW_CONTRACT || ''
export const PUBLIC_CW20_CONTRACT = process.env.NEXT_PUBLIC_CW20_CONTRACT || ''

export const defaultFee = {
  amount: [],
  gas: "400000",
}

export const CW20_DECIMAL = 1000

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [client, setClient] = useState<CosmWasmClient | null>(null)
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [managerAddr, setManagerAddr] = useState('')
  const [minStake, setMinStake] = useState(0.01)
  const [rateClient, setRateClient] = useState(10)
  const [rateManager, setRateManager] = useState(10)

  const [nativeBalanceStr, setNativeBalanceStr] = useState('')
  const [cw20Balance, setCw20Balance] = useState(0)
  const [nativeBalance, setNativeBalance] = useState(0)

  const [detailsAll, setDetailsAll] = useState([])
  

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    connect & disconnect   //////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////


  const connectWallet = async () => {
    setLoading(true)

    try {
      await connectKeplr()

      // enable website to access kepler
      await (window as any).keplr.enable(PUBLIC_CHAIN_ID)

      // get offline signer for signing txs
      const offlineSigner = await (window as any).getOfflineSigner(
        PUBLIC_CHAIN_ID
      )

      // make client
      setClient(
        await CosmWasmClient.connect(PUBLIC_CHAIN_RPC_ENDPOINT)
      )

      // make client
      setSigningClient(
        await SigningCosmWasmClient.connectWithSigner(
          PUBLIC_CHAIN_RPC_ENDPOINT,
          offlineSigner
        )
      )

      // get user address
      const [{ address }] = await offlineSigner.getAccounts()
      setWalletAddress(address)

      setLoading(false)
      NotificationManager.success(`Connected successfully`)
    } catch (error) {
      NotificationManager.error(`ConnectWallet error : ${error}`)
      setLoading(false)
    }
  }

  const disconnect = () => {
    if (signingClient) {
      signingClient.disconnect()
    }
    setIsAdmin(false)
    setWalletAddress('')
    setSigningClient(null)
    setLoading(false)
    NotificationManager.info(`Disconnected successfully`)
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    global variables    /////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const getBalances = async () => {
    setLoading(true)
    try {
      const objectNative:JsonObject = await signingClient.getBalance(walletAddress, PUBLIC_STAKING_DENOM)
      setNativeBalanceStr(`${convertMicroDenomToDenom(objectNative.amount)} ${convertFromMicroDenom(objectNative.denom)}`)
      setNativeBalance(convertMicroDenomToDenom(objectNative.amount))

      const objectCrew:JsonObject = await signingClient.queryContractSmart(PUBLIC_CW20_CONTRACT, {
        balance: { address: walletAddress },
      })
      setCw20Balance(parseInt(objectCrew.balance) / CW20_DECIMAL)
      setLoading(false)
      NotificationManager.info(`Successfully got balances`)
    } catch (error) {
      setLoading(false)
      NotificationManager.error(`GetBalances error : ${error}`)
    }
  }

  const getIsAdmin = async () => {
    
    setLoading(true)
    try {
      const response:JsonObject = await signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
        is_admin: {addr:walletAddress}
      })
      setIsAdmin(response.isadmin)
      setLoading(false)      
      NotificationManager.info(`Successfully got isAdmin`)
    } catch (error) {
      setLoading(false)
      NotificationManager.error(`GetIsAdmin error : ${error}`)
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////    Admin management       //////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const getManagerConstants = async () => {
    setLoading(true)
    try {
      const response:JsonObject = await signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
        constants: {}
      })
      console.log(response)
      setManagerAddr(response.manager_addr)
      setMinStake(response.min_stake)
      setRateClient(response.rate_client)
      setRateManager(response.rate_manager)

      setLoading(false)      
      NotificationManager.success(`Successfully got manager constants`)
    } catch (error) {
      setLoading(false)
      NotificationManager.error(`GetManagerConstants Error : ${error}`)
      console.log(error)
    }
  }

  const setManagerConstants = async () => {
    setLoading(true)
    try {
      
      await signingClient.execute(
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
      )

      setLoading(false)
      getBalances()
      NotificationManager.success('Successfully set manager constants')
    } catch (error) {
      setLoading(false)
      NotificationManager.error(`SetManagerConstants error : ${error}`)
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Send CREW Token to Escrow Contract   ////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const executeSendContract = async (plainMsg:string, amount:number) => {
    setLoading(true)
    // let end_time:number
 
    try {
      let encodedMsg:string = toBase64(new TextEncoder().encode(plainMsg))
    
      await signingClient?.execute(
        walletAddress, // sender address
        PUBLIC_CW20_CONTRACT, // token escrow contract
        { 
          "send":
          {
            "contract":PUBLIC_TOKEN_ESCROW_CONTRACT, 
            "amount":(amount*CW20_DECIMAL).toString(), 
            "msg": encodedMsg
          } 
        }, // msg
        defaultFee,
        undefined,
        []
      )
      setLoading(false)
      getBalances()
      getDetailsAll()
      NotificationManager.success('Successfully executed')
    } catch (error) {
      setLoading(false)
      getBalances()
      NotificationManager.error(`executeSendContract error : ${error}`)
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////////////    Get Staked Full Info   //////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  
  const getDetailsAll = async () => {
    setLoading(true)
    try {
      const response:JsonObject = await signingClient.queryContractSmart(PUBLIC_TOKEN_ESCROW_CONTRACT, {
        details_all: {addr:walletAddress}
      })
      let tempstr:string = "";
      
      console.log(response)
      response.escrows.map((data) => {

        tempstr = data.account_info;
        let accountList:Array<JsonObject> = [];
        if (tempstr.length > 0) {
          tempstr = tempstr.substring(1)
          tempstr.split(";").map((rec) => {
            let arr = rec.split(":")
            let account_info:JsonObject = {"addr": arr[0], "amount":arr[1], "start_time":arr[2], "end_time":arr[3]}
            accountList.push(account_info)
          })
        }
        data.account_info = accountList
        data.isWorkManager = (data.client == walletAddress || isAdmin)
        //data.state
        // 0: canStake
        // 1: Started ( but only can show when expired)
        // 2: Client rewarded
        // 3: manager rewarded
        

      })
      setLoading(false)
      setDetailsAll(response)
      
      NotificationManager.success('Successfully got DetailsAll')
    } catch (error) {
      setLoading(false)
      NotificationManager.error(`GetDetailsAll Error : ${error}`)
      console.log(error)
    }
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ///////    Approve or Refund CREW Token from Escrow Contract   /////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  const executeApproveContract = async (id:string) => {
 
    setLoading(true)
    try {
      
      await signingClient.execute(
        walletAddress, // sender address
        PUBLIC_TOKEN_ESCROW_CONTRACT, // token escrow contract
        { 
          "approve":
          {
            "id":`${id}`
          }
        }, // msg
        defaultFee,
        undefined,
        []
      )

      setLoading(false)
      getDetailsAll()
      getBalances()
      NotificationManager.success('Successfully approved')
    } catch (error) {
      setLoading(false)
      getBalances()
      NotificationManager.error(`Approve error : ${error}`)
    
    }
  }

  const executeRefundContract = async (id:string) => {
 
    setLoading(true)
    try {
      
      await signingClient.execute(
        walletAddress, // sender address
        PUBLIC_TOKEN_ESCROW_CONTRACT, // token escrow contract
        { 
          "refund":
          {
            "id":`${id}`
          }
        }, // msg
        defaultFee,
        undefined,
        []
      )

      setLoading(false)
      getDetailsAll()
      getBalances()
      NotificationManager.success('Successfully refunded')
    } catch (error) {
      setLoading(false)
      getBalances()
      if (error.message.indexOf("Still in your staking expired") < 0)
        NotificationManager.error(`Refund error : ${error.message}`)
      else
        NotificationManager.warning("Still in your staking period")
    }
  }


  return {
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
    detailsAll,

    executeApproveContract,
    executeRefundContract

  }
}
