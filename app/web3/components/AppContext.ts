// import { trackingEvents } from 'analytics/analytics'
// import { mixpanelIdentify } from 'analytics/mixpanel'
import { BigNumber } from 'bignumber.js'
import {
  compareBigNumber,
  ContextConnected,
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
  every10Seconds$,
} from 'blockchain/network'
import { NetworkIds } from 'blockchain/networkIds'
import { networksById } from 'blockchain/networksConfig'

import { createWeb3Context$ } from 'features/web3Context'
import { isEqual, mapValues, memoize } from 'lodash'


import { combineLatest, of } from 'rxjs'
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  mergeMap,
  shareReplay,
  switchMap,
} from 'rxjs/operators'


export function setupAppContext() {
  const chainIdToRpcUrl = mapValues(networksById, (network) => network.rpcUrl)
  const [web3Context$, setupWeb3Context$, switchChains] = createWeb3Context$(chainIdToRpcUrl)

  const account$ = createAccount$(web3Context$)
  const initializedAccount$ = createInitializedAccount$(account$)

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$, everyBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)

  const chainContext$ = context$.pipe(
    distinctUntilChanged(
      (previousContext, newContext) => previousContext.chainId === newContext.chainId,
    ),
    shareReplay(1),
  )

  const connectedContext$ = createContextConnected$(context$)

  combineLatest(account$, connectedContext$)
    .pipe(
      mergeMap(([account, network]) => {
        return of({
          networkName: network.name,
          connectionKind: network.connectionKind,
          account: account?.toLowerCase(),
          method: network.connectionMethod,
          walletLabel: network.walletLabel,
        })
      }),
      distinctUntilChanged(isEqual),
    )
    .subscribe(({ account, networkName, connectionKind, method, walletLabel }) => {
      // if (account) {
      //   mixpanelIdentify(account, { walletType: connectionKind, walletLabel: walletLabel })
      //   trackingEvents.accountChange(account, networkName, connectionKind, method, walletLabel)
      // }
    })


  return {
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    onEveryBlock$,
    connectedContext$,
    chainContext$,
  }
}

export function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

export type AppContext = ReturnType<typeof setupAppContext>
