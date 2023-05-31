import { isAppContextAvailable } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types_xiaoyu'
import React, { createContext, useContext } from 'react'

import { useBridgeConnection } from './useBridgeConnection'

export type Web3OnBoardConnectorContext = {
  connect: (autoConnect?: boolean) => Promise<string | undefined>
}

const web3OnBoardConnectorContext = createContext<Web3OnBoardConnectorContext>({
  connect: () => Promise.resolve(undefined),
})

export const useWeb3OnBoardConnectorContext = () => useContext(web3OnBoardConnectorContext)

function InternalProvider({ children }: WithChildren) {
  const { connect } = useBridgeConnection()

  return (
    <web3OnBoardConnectorContext.Provider
      value={{
        connect,
        // networkConnect,
      }}
    >
      {children}
    </web3OnBoardConnectorContext.Provider>
  )
}

export function Web3OnBoardConnectorProvider({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return children
  }

  return <InternalProvider>{children}</InternalProvider>
}
