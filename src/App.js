import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from 'react-router-dom'
import Chart from './Chart'
import Generator from './Generator'

import Amplify from 'aws-amplify'
import config from './export.json'
Amplify.configure(config);

export default function App() {
  return (
    <Router>
      <div>
        <div className="pb-32 bg-gray-800">
          <nav className="bg-gray-800">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="border-b border-gray-700">
                <div className="flex items-center justify-between h-16 px-4 sm:px-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="w-8 h-8"
                        src="https://docs.amplify.aws/assets/logo-light.svg"
                        alt="amplify logo"
                      />
                    </div>
                    <div className="">
                      <div className="flex items-baseline ml-10 space-x-4">
                        <NavLink
                          to="/"
                          exact
                          activeClassName="px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700"
                          className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                        >
                          Home
                        </NavLink>
                        <NavLink
                          to="/generator"
                          exact
                          activeClassName="px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700"
                          className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                        >
                          Generator
                        </NavLink>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center ml-4 md:ml-6">
                      <button
                        className="p-1 text-gray-400 border-2 border-transparent rounded-full hover:text-white focus:outline-none focus:text-white focus:bg-gray-700"
                        aria-label="Notifications"
                      >
                        <svg
                          className="w-6 h-6"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <header className="py-10">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <Switch>
                <Route exact path="/">
                  <h1 className="text-3xl font-bold leading-9 text-white">
                    Real-time Dashboard
                  </h1>
                </Route>
                <Route path="/generator">
                  <h1 className="text-3xl font-bold leading-9 text-white">
                    Generate data
                  </h1>
                </Route>
              </Switch>
            </div>
          </header>
        </div>

        <main className="-mt-32">
          <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-5 py-6 bg-white rounded-lg shadow sm:px-6">
              <Switch>
                <Route exact path="/">
                  <Chart />
                </Route>
                <Route path="/generator">
                  <Generator />
                </Route>
              </Switch>
            </div>
          </div>
        </main>
      </div>
    </Router>
  )
}
