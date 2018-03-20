import {ApolloLink, NextLink, Observable, Operation, RequestHandler} from 'apollo-link'
import {visit} from 'graphql'

const versionExtractorVisitor = (assets: any) => ({
  Argument (node: any) {
    if (node.name.value === 'version') {
      assets.version = node.value.value
    }
  }
})

const scopeExtractorVisitor = (assets: any) => ({
  Argument (node: any) {
    if (node.name.value === 'scope') {
      assets.scope = node.value.value
    }
  }
})

const uriFromQuery = (query: any) => {
  const assets = {version: '1', scope: 'public'}
  visit(query, versionExtractorVisitor(assets))
  visit(query, scopeExtractorVisitor(assets))

  return `/_v/v${assets.version}/${assets.scope}/graphql`
}

export const uriSwitchLink = new ApolloLink((operation: Operation, forward?: NextLink) => {
  operation.setContext({
    ...operation.getContext(),
    uri: uriFromQuery(operation.query)
  })
  return forward ? forward(operation) : null
})
