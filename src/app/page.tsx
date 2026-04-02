import dynamic from "next/dynamic";

const DealflowApp = dynamic(() => import("@/components/dealflow/DealflowApp"), {
  ssr: true,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Loading DealFlow…</p>
    </div>
  ),
});

export default function Home() {
  return <DealflowApp />;
}
