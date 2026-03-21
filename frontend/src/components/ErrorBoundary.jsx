import React from "react";

const getSessionSnapshot = () => {
  try {
    return {
      path: typeof window !== "undefined" ? window.location.pathname : "",
      hasToken: Boolean(localStorage.getItem("sharebite.token")),
      role: localStorage.getItem("sharebite.role") || "",
    };
  } catch {
    return { path: "", hasToken: false, role: "" };
  }
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null, eventError: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  componentDidMount() {
    this.onWindowError = (event) => {
      if (this.state.error) return;
      const error = event?.error || new Error(event?.message || "Unknown error");
      this.setState({ eventError: error });
    };

    this.onUnhandledRejection = (event) => {
      if (this.state.error) return;
      const reason = event?.reason;
      const error = reason instanceof Error ? reason : new Error(String(reason || "Unhandled promise rejection"));
      this.setState({ eventError: error });
    };

    window.addEventListener("error", this.onWindowError);
    window.addEventListener("unhandledrejection", this.onUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.onWindowError);
    window.removeEventListener("unhandledrejection", this.onUnhandledRejection);
  }

  render() {
    const { error, errorInfo, eventError } = this.state;
    const finalError = error || eventError;
    if (!finalError) return this.props.children;

    const snapshot = getSessionSnapshot();
    const details = [
      `Path: ${snapshot.path}`,
      `Has token: ${snapshot.hasToken}`,
      `Role: ${snapshot.role}`,
      "",
      String(finalError?.stack || finalError),
      errorInfo?.componentStack ? `\nComponent stack:\n${errorInfo.componentStack}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-xl font-extrabold text-[#111814]">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#6b7f77]">
            The app hit a runtime error. Copy the details below and send them to fix the blank page.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="h-9 rounded-full bg-green-600 px-5 text-sm font-bold text-white hover:bg-green-700"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <button
              type="button"
              className="h-9 rounded-full bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(details);
                } catch {
                  // Ignore clipboard failures.
                }
              }}
            >
              Copy error
            </button>
          </div>
          <pre className="mt-6 whitespace-pre-wrap rounded-xl border border-[#e6eee9] bg-[#f7faf8] p-4 text-xs text-[#111814]">
            {details}
          </pre>
        </div>
      </div>
    );
  }
}

