
"use client";

export default function AdminHeader() {
  return (
    <div className="bg-base-100 sticky top-0 z-50 flex lg:ps-75">
      <div className="mx-auto w-full max-w-7xl">
        <nav className="navbar h-16">
          <button
            type="button"
            className="btn btn-soft btn-square btn-sm me-2 lg:hidden"
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="layout-toggle"
            data-overlay="#layout-toggle"
          >
            <span className="icon-[tabler--menu-2] size-4.5"></span>
          </button>
        </nav>
      </div>
    </div>
  );
}
