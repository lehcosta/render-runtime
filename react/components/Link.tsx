import PropTypes from 'prop-types'
import React, {Component, MouseEvent} from 'react'
import {NavigateOptions} from '../utils/pages'

const isLeftClickEvent = (event: MouseEvent<HTMLAnchorElement>) => event.button === 0

const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

const absoluteRegex = /^https?:\/\/|^\/\//i

const isAbsoluteUrl = (url: string) => absoluteRegex.test(url)

interface Props {
  onClick: () => void,
  page?: string,
  params?: any,
  query?: string,
  to?: string,
}

// eslint-disable-next-line
export default class Link extends Component<Props> {
  public static contextTypes = {
    navigate: PropTypes.func
  }

  public static defaultProps = {
    onClick: () => { return },
  }

  public static propTypes = {
    onClick: PropTypes.func,
    page: PropTypes.string,
    params: PropTypes.object,
    query: PropTypes.string,
    to: PropTypes.string,
  }

  public handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const {page, params, query, to} = this.props
    if (
      isModifiedEvent(event) ||
      !isLeftClickEvent(event) ||
      (to && isAbsoluteUrl(to))
    ) {
      return
    }

    this.props.onClick()

    const options: NavigateOptions = {page, params, query, to, fallbackToWindowLocation: false}
    if (this.context.navigate(options)) {
      event.preventDefault()
    }
  }

  public render() {
    return <a href={this.props.to} {...this.props} onClick={this.handleClick} />
  }
}
