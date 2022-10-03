import React, { useState, useEffect, useReducer } from 'react'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { API } from 'aws-amplify'
import { CreateDataPoint } from './graphql'

const STEP = 200

function reducer(state, action) {
  // const { date, time, series, value} = state;
  if (action.type === 'tick') {
    return {
      ...state,
      count: state.count + 1,
      ticker: new Date(state.ticker.getTime() + 60 * 1000 * 30),
    }
  } else if (action.type === 'update') {
    const temp = { ...state, ...action.data }
    const ticker = new Date(temp.date)
    ticker.setMinutes(temp.time.getMinutes())
    ticker.setHours(temp.time.getHours())
    return { ...temp, ticker }
  } else {
    throw new Error()
  }
}

const date = new Date()
function Generator() {
  const [live, setLive] = useState(false)
  const [feedback, setFeedback] = useState([])
  const [state, dispatch] = useReducer(reducer, {
    date: date,
    time: date,
    ticker: date,
    series: 'hello-world',
    count: 0,
  })

  useEffect(() => {
    if (!live) {
      return
      // return
      // clearInterval will be stopped by effect
    }

    setFeedback([])
    const id = setInterval(() => {
      dispatch({ type: 'tick' })
    }, STEP)
    return () => {
      console.log('clear interval', id)
      clearInterval(id)
    }
  }, [live, dispatch])

  useEffect(() => {
    if (!live) {
      return
    }
    const { ticker, series } = state
    // const temp = new Date(date)
    // temp.setMinutes(ticker.getMinutes())
    // temp.setHours(ticker.getHours())
    console.log(ticker.toISOString())
    API.graphql({
      query: CreateDataPoint,
      variables: {
        input: {
          createdAt: ticker.toISOString(),
          name: series,
          value: parseInt(Math.random() * 60) + 20,
        },
      },
    })
      .then((received) => {
        // console.log('new log -> ', received)
        setFeedback((f) => [
          ...f,
          { id: `feedback=${f.length}`, success: true },
        ])
      })
      .catch((error) => {
        // console.log('error ->', error)
        setFeedback((f) => [
          ...f,
          { id: `feedback=${f.length}`, success: false },
        ])
      })
  }, [live, state])

  return (
    <div className="Generator">
      <div className="flex flex-col">
        <div className="px-4 mt-6 space-y-6">
          <div className="flex items-center">
            <label
              htmlFor="series"
              className="flex-shrink-0 block w-1/3 text-sm font-medium leading-5 text-gray-700"
            >
              Series Name:
            </label>
            <div className="flex-grow mt-1 ml-4 rounded-md shadow-sm">
              <input
                id="series"
                value={state.series}
                disabled={live}
                onChange={(e) =>
                  dispatch({ type: 'update', data: { series: e.target.value } })
                }
                type="text"
                required
                className="block w-full px-3 py-2 placeholder-gray-400 transition duration-150 ease-in-out border border-gray-300 rounded-md appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label
              htmlFor="date"
              className="flex-shrink-0 block w-1/3 text-sm font-medium leading-5 text-gray-700"
            >
              Date
            </label>
            <div className="flex-grow ml-4 rounded-md shadow-sm w-full-date">
              <DatePicker
                id="date"
                onChange={(date) =>
                  dispatch({ type: 'update', data: { date } })
                }
                disabled={live}
                selected={state.date}
                className="block w-full px-3 py-2 placeholder-gray-400 transition duration-150 ease-in-out border border-gray-300 rounded-md w-appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label
              htmlFor="time"
              className="flex-shrink-0 block w-1/3 text-sm font-medium leading-5 text-gray-700"
            >
              Start At
            </label>
            <div className="flex-grow mt-1 ml-4 rounded-md shadow-sm w-full-date">
              <DatePicker
                id="time"
                onChange={(time) =>
                  dispatch({ type: 'update', data: { time } })
                }
                disabled={live}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                selected={state.time}
                className="block w-full px-3 py-2 placeholder-gray-400 transition duration-150 ease-in-out border border-gray-300 rounded-md w-appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              />
            </div>
          </div>

          <div className="mt-6">
            <span className="block w-full rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setLive((l) => !l)}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out bg-gray-600 border border-transparent rounded-md disabled:cursor-not-allowed disabled:opacity-75 hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:shadow-outline-indigo active:bg-gray-700"
              >
                {live ? 'Stop' : 'Start'}
              </button>
            </span>
          </div>
        </div>
        <div className="p-4 mt-8">
          <h1 className="text-2xl font-bold leading-9">{state.count}</h1>
          <div className="flex flex-wrap mt-6 space-x-1 feedback">
            {feedback.map((p) => (
              <span
                key={p.id}
                className={`mt-1 block h-2 w-2 rounded-full text-white shadow-solid ${
                  p.success ? 'bg-green-300' : 'bg-red-300'
                }`}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Generator
