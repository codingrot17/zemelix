export default function AdminDashboard() {
    const metrics = [
        { label: "Total users", detail: "Live user reporting is not connected yet." },
        { label: "Orders", detail: "Live order reporting is not connected yet." },
        { label: "Revenue", detail: "Verified payment reporting is not connected yet." },
        { label: "Active vendors", detail: "Live vendor reporting is not connected yet." },
    ];

    return (
        <main className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    Admin dashboard
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Platform overview and operational status.
                </p>
            </header>

            <section
                aria-labelledby="platform-metrics-heading"
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"
            >
                <h2 id="platform-metrics-heading" className="font-semibold text-amber-950 dark:text-amber-100">
                    Live reporting is not connected
                </h2>
                <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
                    The figures previously shown here were sample data, not Zemelix production records.
                    They have been removed so this dashboard does not misrepresent platform activity.
                </p>
            </section>

            <section aria-label="Metric availability" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <article
                        key={metric.label}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {metric.label}
                        </h2>
                        <p className="mt-3 text-2xl font-semibold text-gray-400 dark:text-gray-500">
                            Not available
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {metric.detail}
                        </p>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent orders
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Recent-order reporting is not connected. No sample orders are displayed.
                    </p>
                </article>
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent users
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Recent-user reporting is not connected. No sample users or email addresses are displayed.
                    </p>
                </article>
            </section>
        </main>
    );
}
