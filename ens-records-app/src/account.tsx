import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { useWriteContract } from 'wagmi'


export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  // Function to truncate the address
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 5)}...${address.substring(address.length - 3)}`;
  }

  return (
    <div className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow border border-gray-300">
      {ensAvatar && (
        <img
          alt="ENS Avatar"
          src={ensAvatar}
          className="w-10 h-10 rounded-full border border-gray-200"
        />
      )}
      <div>
        {address && (
          <div className="text-sm font-medium">
            {ensName ? `${ensName} (${truncateAddress(address)})` : truncateAddress(address)}
          </div>
        )}
      </div>
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
      >
        Disconnect
      </button>
    </div>
  )
}
