import {InMemoryCache, NormalizedCacheObject} from 'apollo-cache-inmemory'
import {ApolloClient} from 'apollo-client'
import {BatchHttpLink} from 'apollo-link-batch-http'
import {createHttpLink} from 'apollo-link-http'
import {createPersistedQueryLink} from 'apollo-link-persisted-queries'
import {canUseDOM} from 'exenv'
import {uriSwitchLink} from './links/uriSwitchLink'
import {versionSplitterLink} from './links/versionSplitterLink'

interface ApolloClientsRegistry {
  [key: string]: ApolloClient<NormalizedCacheObject>
}

function getDataIdFromObject(value: any) {
  if (!value) {
    return null
  }
  const {id, __typename} = value
  return id && __typename ? `${__typename}:${id}` : null
}

const clientsByWorkspace: ApolloClientsRegistry = {}

export const getState = (runtime: RenderRuntime) => {
  const {account, workspace} = runtime
  return clientsByWorkspace[`${account}/${workspace}`].cache.extract()
}

export const getClient = (runtime: RenderRuntime) => {
  const {account, workspace} = runtime

  if (!clientsByWorkspace[`${account}/${workspace}`]) {
    const cache = new InMemoryCache({
      addTypename: true,
      dataIdFromObject: getDataIdFromObject,
    })

    const httpLink = new BatchHttpLink({
      batchInterval: 80,
      credentials: 'same-origin',
    })

    const persistedQueryLink = createPersistedQueryLink({
      disable: () => true,
      generateHash: ({documentId}: any) => documentId,
      useGETForHashedQueries: true
    })

    const link = versionSplitterLink.concat(uriSwitchLink.concat(persistedQueryLink.concat(httpLink)))

    clientsByWorkspace[`${account}/${workspace}`] = new ApolloClient({
      cache: canUseDOM ? cache.restore(global.__STATE__) : cache,
      link,
      ssrMode: !canUseDOM,
    })
  }

  return clientsByWorkspace[`${account}/${workspace}`]
}
