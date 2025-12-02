export default function TeacherIndex() {
  return (
    <>
      <div className="rounded-box bg-base-100 w-full flex  gap-4  max-xl:flex-col">
        <div className="flex flex-1 gap-4 max-sm:flex-col">
          <div className="flex flex-1 flex-col gap-4">
            <div className="text-base-content flex items-center gap-2">
              <div className="avatar avatar-placeholder">
                <div className="bg-base-200 rounded-field size-9">
                  <span className="icon-[tabler--eye] size-6"></span>
                </div>
              </div>
              <h5 className="text-lg font-medium">Pageviews</h5>
            </div>
            <div>
              <div className="text-base-content text-xl font-semibold">
                17,356
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-success inline-flex items-center gap-1">
                  <span className="icon-[tabler--arrow-up] size-4"></span>
                  25.6%
                </span>
                <span className="text-base-content/50 font-medium">
                  EPC: 308.20
                </span>
              </div>
            </div>
          </div>
          <div className="divider sm:divider-horizontal"></div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="text-base-content flex items-center gap-2">
              <div className="avatar avatar-placeholder">
                <div className="bg-base-200 rounded-field size-9">
                  <span className="icon-[tabler--mouse] size-6"></span>
                </div>
              </div>
              <h5 className="text-lg font-medium">Click</h5>
            </div>
            <div>
              <div className="text-base-content text-xl font-semibold">
                2,784
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-error inline-flex items-center gap-1">
                  <span className="icon-[tabler--arrow-down] size-4"></span>
                  25.6%
                </span>
                <span className="text-base-content/50 font-medium">
                  Related Value: 77,359
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="divider xl:divider-horizontal"></div>
        <div className="flex flex-1 gap-4 max-sm:flex-col">
          <div className="flex flex-1 flex-col gap-4">
            <div className="text-base-content flex items-center gap-2">
              <div className="avatar avatar-placeholder">
                <div className="bg-base-200 rounded-field size-9">
                  <span className="icon-[tabler--chart-bar] size-6"></span>
                </div>
              </div>
              <h5 className="text-lg font-medium">Commission</h5>
            </div>
            <div>
              <div className="text-base-content text-xl font-semibold">
                $1,658
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-success inline-flex items-center gap-1">
                  <span className="icon-[tabler--arrow-up] size-4"></span>
                  25.6%
                </span>
                <span className="text-base-content/50 font-medium">
                  Related Value: 77,359
                </span>
              </div>
            </div>
          </div>
          <div className="divider sm:divider-horizontal"></div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="text-base-content flex items-center gap-2">
              <div className="avatar avatar-placeholder">
                <div className="bg-base-200 rounded-field size-9">
                  <span className="icon-[tabler--currency-dollar] size-6"></span>
                </div>
              </div>
              <h5 className="text-lg font-medium">Sales</h5>
            </div>
            <div>
              <div className="text-base-content text-xl font-semibold">
                $8,759
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-success inline-flex items-center gap-1">
                  <span className="icon-[tabler--arrow-up] size-4"></span>
                  25.6%
                </span>
                <span className="text-base-content/50 font-medium">
                  Related Value: 13.85
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center">
        <div className="h-full max-h-160 w-full overflow-y-auto">
          <div className="card-body gap-0 space-y-6">
            <div className="flex w-full items-start gap-6 max-md:flex-col">
              <div className="grow space-y-6 max-md:w-full">
                <h2 className="card-title text-xl">Sales Metrics</h2>

                <div className="flex items-center gap-4">
                  
                  <div>
                    <h3 className="text-base-content text-xl font-medium">
                      Flyonui Company
                    </h3>
                    <p className="text-base-content/80">flyonui@company.com</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border-base-content/20 rounded-box flex gap-4 border px-4 py-3">
                    <div className="avatar avatar-placeholder">
                      <div className="bg-warning/20 text-warning rounded-field size-11.5">
                        <span className="icon-[tabler--trending-up] size-6"></span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base-content/50 text-sm font-medium">
                        Sales trend
                      </span>
                      <span className="text-base-content text-lg font-semibold">
                        $ 11,548
                      </span>
                    </div>
                  </div>
                  <div className="border-base-content/20 rounded-box flex gap-4 border px-4 py-3">
                    <div className="avatar avatar-placeholder">
                      <div className="text-success bg-success/20 rounded-field size-11.5">
                        <span className="icon-[tabler--chart-bar] size-6"></span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base-content/50 text-sm font-medium">
                        Total Profit
                      </span>
                      <span className="text-base-content text-lg font-semibold">
                        $1735
                      </span>
                    </div>
                  </div>
                  <div className="border-base-content/20 rounded-box flex gap-4 border px-4 py-3">
                    <div className="avatar avatar-placeholder">
                      <div className="text-primary bg-primary/20 rounded-field size-11.5">
                        <span className="icon-[tabler--discount-2] size-6"></span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base-content/50 text-sm font-medium">
                        Discounts
                      </span>
                      <span className="text-base-content text-lg font-semibold">
                        $ 14,987
                      </span>
                    </div>
                  </div>
                  <div className="border-base-content/20 rounded-box flex gap-4 border px-4 py-3">
                    <div className="avatar avatar-placeholder">
                      <div className="text-accent bg-accent/20 rounded-field size-11.5">
                        <span className="icon-[tabler--wallet] size-6"></span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base-content/50 text-sm font-medium">
                        Refunds
                      </span>
                      <span className="text-base-content text-lg font-semibold">
                        $3248
                      </span>
                    </div>
                  </div>
                </div>
              </div>

             
                
                  <div className="zq390 d50ic w-full w26jd shadow-md">
                    <div className="l7s0y flex items-center justify-between bglhu">
                      <h4 className="iqv7o bk5oo">External Links</h4>
                      <div className="dropdown relative inline-flex">
                        <button
                          id="dropdown-days"
                          type="button"
                          className="dropdown-toggle btn btn-text text-base-content/50 btn-circle btn-sm"
                          aria-haspopup="menu"
                          aria-expanded="false"
                          aria-label="Dropdown"
                        >
                          <span className="icon-[tabler--dots-vertical] girx5"></span>
                        </button>
                        <ul
                          className="dropdown-menu dropdown-open:opacity-100 hidden"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="dropdown-days"
                        >
                          <li>
                            <a className="dropdown-item" href="#">
                              Select All
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Refresh
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Share
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="nqxya ip6vv">
                      <div id="externalLinkChart" className="w-full"></div>

                      <div className="nbone">
                        <div className="flex w-full items-center ip6vv">
                          <div className="flex sxihv items-center bglhu">
                            <span className="bg-primary inline-block ue1bl shrink-0 rounded-full"></span>
                            <span className="font-medium">
                              Google Analytics
                            </span>
                          </div>
                          <span className="text-base-content/80 text-sm font-medium">
                            $342k
                          </span>
                          <div className="flex items-center rsqkx">
                            <span className="text-base-content/80 text-sm font-medium">
                              82%
                            </span>
                            <span className="icon-[tabler--chevron-down] text-error girx5"></span>
                          </div>
                        </div>
                        <div className="flex w-full items-center ip6vv">
                          <div className="flex sxihv items-center bglhu">
                            <span className="dxw29 inline-block ue1bl shrink-0 rounded-full"></span>
                            <span className="font-medium">Facebook Ads</span>
                          </div>
                          <span className="text-base-content/80 text-sm font-medium">
                            $12.4k
                          </span>
                          <div className="flex items-center rsqkx">
                            <span className="text-base-content/80 text-sm font-medium">
                              52%
                            </span>
                            <span className="icon-[tabler--chevron-up] text-success girx5"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
               
             
            </div>

            <div className="border-base-content/20 rounded-box flex gap-6 border p-6 max-md:flex-col">
              <div className="space-y-4">
                <h3 className="card-title">Sales Plan</h3>
                <div className="text-base-content text-7xl font-medium">
                  54%
                </div>
                <p className="text-base-content/50 text-lg">
                  Percentage profit from total sales
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-base-content text-xl font-medium">
                  Cohart analysis indicators
                </h3>
                <p className="text-base-content/50">
                  Analyzes the behaviour of a group of users who joined a
                  product/service at the same time, over a certain period.
                </p>

                <div className="text-base-content flex gap-6 max-sm:flex-col sm:items-center">
                  <div className="flex items-center gap-2">
                    <span className="icon-[tabler--chart-infographic] size-6"></span>
                    <span className="text-lg font-medium">Open Statistics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="icon-[tabler--percentage] size-6"></span>
                    <span className="text-lg font-medium">
                      Percentage Change
                    </span>
                  </div>
                </div>

                <div className="progress rounded-field h-7 *:rounded-none">
                  <div className="progress-bar progress-primary w-full"></div>
                  <div className="progress-bar bg-primary/50 w-3/4"></div>
                  <div className="progress-bar bg-primary/30 w-2/4"></div>
                  <div className="progress-bar bg-primary/10 w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
