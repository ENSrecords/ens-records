import * as React from 'react';
import { Connector, useConnect } from 'wagmi';

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-white rounded-lg shadow-md border border-gray-200 max-w-md mx-auto">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}
