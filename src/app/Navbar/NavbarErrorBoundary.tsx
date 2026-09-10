"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Keep the rest of the page alive if the header JS throws on an old WebView. */
export default class NavbarErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <header className="fixed inset-x-0 top-0 z-[999] border-b border-[#E4DDD2] bg-white">
          <div className="flex h-14 items-center justify-between px-4">
            <a href="/" className="text-sm font-semibold tracking-wide text-[#1C1917]">
              EVUDDY
            </a>
            <a
              href="/ride-options"
              className="bg-[#1F6B4A] px-3 py-2 text-sm font-medium text-white"
            >
              Book EV
            </a>
          </div>
        </header>
      );
    }
    return this.props.children;
  }
}
