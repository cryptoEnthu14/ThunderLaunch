export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8">
          <span className="text-thunder-blue">Thunder</span>
          <span className="text-lightning-yellow">Launch</span>
        </h1>
        <p className="text-center text-xl mb-12">
          Welcome to your Next.js 14 application
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-6 border-2 border-thunder-blue rounded-lg">
            <h3 className="font-bold text-thunder-blue mb-2">Thunder Blue</h3>
            <p className="text-xs text-gray-600">#0066FF</p>
          </div>
          <div className="p-6 border-2 border-lightning-yellow rounded-lg bg-lightning-yellow/10">
            <h3 className="font-bold text-lightning-yellow mb-2">Lightning Yellow</h3>
            <p className="text-xs text-gray-600">#FFD700</p>
          </div>
          <div className="p-6 border-2 border-thunder-purple rounded-lg">
            <h3 className="font-bold text-thunder-purple mb-2">Thunder Purple</h3>
            <p className="text-xs text-gray-600">#8B5CF6</p>
          </div>
          <div className="p-6 border-2 border-safety-green rounded-lg">
            <h3 className="font-bold text-safety-green mb-2">Safety Green</h3>
            <p className="text-xs text-gray-600">#10B981</p>
          </div>
          <div className="p-6 border-2 border-warning-orange rounded-lg">
            <h3 className="font-bold text-warning-orange mb-2">Warning Orange</h3>
            <p className="text-xs text-gray-600">#F59E0B</p>
          </div>
          <div className="p-6 border-2 border-danger-red rounded-lg">
            <h3 className="font-bold text-danger-red mb-2">Danger Red</h3>
            <p className="text-xs text-gray-600">#EF4444</p>
          </div>
        </div>
      </div>
    </main>
  )
}
