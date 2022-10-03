import React, { useState, useEffect, useReducer } from 'react'

import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import { ResponsiveLine as Line } from '@nivo/line'

import { API } from 'aws-amplify'

import { QueryDataPoints } from './graphql'
import { OnCreateDataPoint } from './graphql'

const limit = 192 / 3
const commonProperties = {
  // width: 900,
  // height: 400,
  margin: { top: 20, right: 20, bottom: 60, left: 80 },
  enableSlices: 'x',
}

const combine = (data, dps) => {
  const mapped = dps.map((dp) => ({ x: new Date(dp.createdAt), y: dp.value }))
  const all = [...data, ...mapped]
  const sub = all.length <= limit ? all : all.slice(all.length - limit)
  return sub
}

const RealTimeChart = ({ name, dataPoints: dps = [], live = false }) => {
  const [data, setData] = useState([])

  // console.log(logs)
  useEffect(() => {
    setData((data) => combine(data, dps))
  }, [dps])

  useEffect(() => {
    return () => {
      console.log('reset name. clear data')
      setData([])
    }
  }, [name])

  useEffect(() => {
    if (live) {
      console.log('going live. clear data')
      setData([])
    }
  }, [live])

  // const tickValues = 'every 1 minutes'
  const tickValues = 'every 4 hours'

  const liveConfig = {
    enablePoints: false,
    isInteractive: false,
    animate: false,
  }
  const viewConfig = {
    enablePoints: true,
    isInteractive: true,
    animate: true,
  }

  return (
    <Line
      {...commonProperties}
      {...(live ? liveConfig : viewConfig)}
      margin={{ top: 30, right: 50, bottom: 60, left: 50 }}
      data={[{ id: name, data }]}
      xScale={{ type: 'time', format: 'native' }}
      yScale={{ type: 'linear', max: 100 }}
      axisTop={{
        format: '%x',
        tickValues: 'every day',
      }}
      axisBottom={{
        format: '%I:%M %p',
        tickValues,
        legend: name,
        legendPosition: 'middle',
        legendOffset: 46,
      }}
      axisRight={{}}
      enableGridX={true}
      curve="monotoneX"
      useMesh={true}
      theme={{
        axis: { ticks: { text: { fontSize: 14 } } },
        grid: { line: { stroke: '#ddd', strokeDasharray: '1 2' } },
      }}
      enableSlices={false}
      motionStiffness={120}
      motionDamping={50}
      xFormat={(value) => `${format(value, 'p')}`}
    />
  )
}

const tokenReducer = (state, action) => {
  switch (action.type) {
    case 'query':
      return { ...state, next: action.token }
    case 'next':
      return {
        ...state,
        prev: state.current,
        current: state.next,
        next: undefined,
      }
    case 'prev':
      return {
        ...state,
        next: state.current,
        current: state.prev,
        prev: undefined,
      }
    case 'reset':
      return { current: null }
    default:
      throw new Error()
  }
}

function Chart() {
  const [live, setLive] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date())

  const [dataPoints, setDataPoints] = useState([])

  const [tokens, dispatchToken] = useReducer(tokenReducer, {})

  useEffect(() => {
    console.log('+', JSON.stringify(tokens, null, 2))
  }, [tokens])

  const fetch = async (nextToken, type) => {
    const received = await API.graphql({
      query: QueryDataPoints,
      variables: {
        name,
        nextToken,
        limit,
        createdAt: { beginsWith: format(date, 'yyyy-MM-dd') },
      },
    })
    console.log(received)
    setDataPoints(received.data.queryDataPointsByNameAndDateTime.items)
    dispatchToken({ type })
    dispatchToken({
      type: 'query',
      token:
        received.data.queryDataPointsByNameAndDateTime.nextToken || undefined,
    })
  }

  useEffect(() => {
    if (!live || !name) {
      return
    }
    // setup subscription
    console.log('starting sub on', name)
    const subscription = API.graphql({
      query: OnCreateDataPoint,
      variables: { name: name },
    }).subscribe({
      next: (received) => {
        setDataPoints([received.value.data.onCreateDataPoint])
      },
    })

    return () => {
      console.log('stopping subscription')
      subscription.unsubscribe()
    }
  }, [name, live])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetch(null, 'reset')
  }

  const handleGoLive = () => {
    setDataPoints([])
    dispatchToken({ type: 'reset' })
    setLive((l) => !l)
  }

  return (
    <div className="App ">
      <div className="flex justify-between px-4 space-x-2 md:px-0">
        <form className="flex space-x-2" onSubmit={handleSubmit}>
          <div className="relative w-48 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 text-gray-400"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <input
              id="name"
              value={name}
              disabled={live}
              autoComplete="off"
              type="text"
              placeholder="series name"
              onChange={(e) => setName(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          {!live && (
            <>
              <div>
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  disabled={live}
                  customInput={<Input />}
                />
              </div>
              <div className="">
                <span className="block w-full rounded-md shadow-sm">
                  <button
                    disabled={!name || live}
                    type="submit"
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out bg-gray-600 border border-transparent rounded-md disabled:cursor-not-allowed disabled:opacity-75 hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:shadow-outline-indigo active:bg-gray-700"
                  >
                    view
                  </button>
                </span>
              </div>
            </>
          )}
        </form>
        <div className="">
          <span className="block w-full rounded-md shadow-sm">
            <button
              disabled={!name}
              onClick={() => handleGoLive()}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out bg-gray-600 border border-transparent rounded-md disabled:cursor-not-allowed disabled:opacity-75 hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:shadow-outline-indigo active:bg-gray-700"
            >
              {!live ? 'Go live' : 'Stop'}
            </button>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-8 space-x-4">
        <div className="flex-shrink-0 w-16">
          {tokens.prev !== undefined && (
            <span className="inline-flex rounded-full shadow-sm">
              <button
                type="button"
                className="active:bg-gray-700 bg-gray-600 border border-transparent duration-150 ease-in-out focus:border-gray-700 focus:outline-none focus:shadow-outline-indigo font-medium hover:bg-gray-500 inline-flex items-center leading-5 p-2 rounded-full text-sm text-white transition"
                onClick={(e) => fetch(tokens.prev, 'prev')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>
            </span>
          )}
        </div>
        <div className="relative flex-grow graph">
          <div className="absolute top-0 w-full h-full">
            <RealTimeChart {...{ name, live, dataPoints }} />
          </div>
        </div>
        <div className="flex-shrink-0 w-16">
          {tokens.next !== undefined && (
            <span className="inline-flex rounded-full shadow-sm">
              <button
                type="button"
                className="active:bg-gray-700 bg-gray-600 border border-transparent duration-150 ease-in-out focus:border-gray-700 focus:outline-none focus:shadow-outline-indigo font-medium hover:bg-gray-500 inline-flex items-center leading-5 p-2 rounded-full text-sm text-white transition"
                onClick={(e) => fetch(tokens.next, 'next')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                </svg>
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const Input = React.forwardRef(
  ({ value, onClick, onChange, disabled, ...rest }, ref) => (
    <div className="relative w-48 rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 text-gray-400"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        id="userDate"
        type="text"
        value={value}
        onChange={onChange}
        onFocus={onClick}
        disabled={disabled}
        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
        autoComplete="off"
      />
    </div>
  )
)

export default Chart
