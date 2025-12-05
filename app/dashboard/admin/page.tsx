export default function AdminIndex() {
  return (
    <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-base-content">Performance Dashboard</h1>
          <p className="text-base-content/60 mt-2">Overview of your teaching metrics and engagement</p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--calendar] size-5 text-base-content/70"></span>
              <span className="text-base-content font-medium">Last 30 Days</span>
            </div>
            <button className="btn btn-sm btn-outline">
              <span className="icon-[tabler--calendar] size-4"></span>
              Select Date Range
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pageviews Card */}
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="icon-[tabler--eye] size-6 text-blue-600 dark:text-blue-400"></span>
                </div>
                <div className="badge badge-success badge-sm gap-1">
                  <span className="icon-[tabler--trending-up] size-3"></span>
                  +25.6%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-1">17,356</h3>
              <p className="text-base-content/70 text-sm mb-3">Total Pageviews</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/50">EPC: $308.20</span>
                <span className="text-success font-medium">On Track</span>
              </div>
            </div>
          </div>

          {/* Click Card */}
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <span className="icon-[tabler--mouse] size-6 text-green-600 dark:text-green-400"></span>
                </div>
                <div className="badge badge-error badge-sm gap-1">
                  <span className="icon-[tabler--trending-down] size-3"></span>
                  -25.6%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-1">2,784</h3>
              <p className="text-base-content/70 text-sm mb-3">Total Clicks</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/50">Value: $77,359</span>
                <span className="text-error font-medium">Needs Attention</span>
              </div>
            </div>
          </div>

          {/* Commission Card */}
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <span className="icon-[tabler--chart-bar] size-6 text-purple-600 dark:text-purple-400"></span>
                </div>
                <div className="badge badge-success badge-sm gap-1">
                  <span className="icon-[tabler--trending-up] size-3"></span>
                  +25.6%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-1">$1,658</h3>
              <p className="text-base-content/70 text-sm mb-3">Commission Earned</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/50">Avg: $45.2/day</span>
                <span className="text-success font-medium">Excellent</span>
              </div>
            </div>
          </div>

          {/* Sales Card */}
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <span className="icon-[tabler--currency-dollar] size-6 text-amber-600 dark:text-amber-400"></span>
                </div>
                <div className="badge badge-success badge-sm gap-1">
                  <span className="icon-[tabler--trending-up] size-3"></span>
                  +25.6%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-base-content mb-1">$8,759</h3>
              <p className="text-base-content/70 text-sm mb-3">Total Sales</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/50">Rate: 13.85%</span>
                <span className="text-success font-medium">Growing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Conversion Rate */}
          <div className="card bg-base-100 shadow">
            <div className="card-body p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-info/10 rounded-lg">
                  <span className="icon-[tabler--arrows-exchange] size-5 text-info"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content">Conversion Rate</h4>
                  <p className="text-sm text-base-content/60">Click to Sale Ratio</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-base-content">16.03%</div>
                  <div className="text-success text-sm flex items-center gap-1 mt-1">
                    <span className="icon-[tabler--arrow-up] size-3"></span>
                    2.4% from last month
                  </div>
                </div>
                <div className="radial-progress text-info" style={{ "--value": 75, "--size": "3rem" }}>
                  75%
                </div>
              </div>
            </div>
          </div>

          {/* Avg. Session Duration */}
          <div className="card bg-base-100 shadow">
            <div className="card-body p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <span className="icon-[tabler--clock] size-5 text-secondary"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content">Avg. Session</h4>
                  <p className="text-sm text-base-content/60">Engagement Time</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-base-content">4m 32s</div>
                  <div className="text-success text-sm flex items-center gap-1 mt-1">
                    <span className="icon-[tabler--arrow-up] size-3"></span>
                    48s longer
                  </div>
                </div>
                <div className="text-3xl text-secondary font-bold">↑</div>
              </div>
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="card bg-base-100 shadow">
            <div className="card-body p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="icon-[tabler--star] size-5 text-primary"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content">Top Content</h4>
                  <p className="text-sm text-base-content/60">Most Viewed Course</p>
                </div>
              </div>
              <div>
                <div className="font-medium text-base-content">Advanced React Patterns</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-base-content/60">3,458 views</div>
                  <div className="badge badge-primary badge-sm">BEST SELLER</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-100 shadow">
          <div className="card-body p-5">
            <h3 className="text-lg font-semibold text-base-content mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="btn btn-outline btn-sm gap-2">
                <span className="icon-[tabler--report-analytics] size-4"></span>
                Generate Report
              </button>
              <button className="btn btn-outline btn-sm gap-2">
                <span className="icon-[tabler--download] size-4"></span>
                Export Data
              </button>
              <button className="btn btn-outline btn-sm gap-2">
                <span className="icon-[tabler--adjustments] size-4"></span>
                Filter Results
              </button>
              <button className="btn btn-primary btn-sm gap-2">
                <span className="icon-[tabler--plus] size-4"></span>
                Create New
              </button>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-base-content">Performance Trend</h3>
                <select className="select select-sm select-bordered w-32">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="h-64 flex items-center justify-center bg-base-200/50 rounded-lg">
                <div className="text-center">
                  <span className="icon-[tabler--chart-line] size-12 text-base-content/30 mb-2"></span>
                  <p className="text-base-content/50">Performance chart visualization would appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
